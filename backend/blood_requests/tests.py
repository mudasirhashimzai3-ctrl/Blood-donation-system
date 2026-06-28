import shutil
import tempfile
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from asgiref.sync import async_to_sync
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.testing import WebsocketCommunicator
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import RolePermission, User, UserPermission
from core.models import Permission
from core.services.settings_service import update_section
from donors.models import Donor
from hospitals.models import Hospital
from notifications.auth import JwtAuthMiddleware
from notifications.models import Notification
from notifications.routing import websocket_urlpatterns
from recipients.models import Recipient

from donations.models import Donation

from .models import BloodRequest, BloodRequestNotification
from .tasks import run_request_automation


def sample_pdf(name="report.pdf"):
    content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    return SimpleUploadedFile(name, content, content_type="application/pdf")


def sample_image(name="prescription.jpg"):
    gif_bytes = (
        b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
        b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x00\x00\x00\x00\x00"
        b"\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b"
    )
    return SimpleUploadedFile(name, gif_bytes, content_type="image/gif")


class BloodRequestApiTests(APITestCase):
    base_url = "/api/blood-requests/"
    media_dir = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media_dir = tempfile.mkdtemp()
        cls.override_media = override_settings(MEDIA_ROOT=cls.media_dir)
        cls.override_media.enable()

    @classmethod
    def tearDownClass(cls):
        cls.override_media.disable()
        if cls.media_dir:
            shutil.rmtree(cls.media_dir, ignore_errors=True)
        super().tearDownClass()

    @classmethod
    def setUpTestData(cls):
        actions = ["view", "add", "change", "delete"]
        permissions = {}
        for action in actions:
            permission, _ = Permission.objects.get_or_create(
                module="blood_requests",
                action=action,
                defaults={"description": f"Can {action} blood requests"},
            )
            permissions[action] = permission

        for action in actions:
            RolePermission.objects.get_or_create(role_name="admin", permission=permissions[action])
        for action in ["view", "add", "change", "delete"]:
            RolePermission.objects.get_or_create(role_name="recipient", permission=permissions[action])
        for action in ["view", "add", "change"]:
            RolePermission.objects.get_or_create(role_name="donor", permission=permissions[action])
        RolePermission.objects.get_or_create(role_name="viewer", permission=permissions["view"])

    def setUp(self):
        self.admin = User.objects.create_user(
            username="blood_req_admin",
            password="StrongPass123!",
            role_name="admin",
        )
        self.recipient_user = User.objects.create_user(
            username="blood_req_recipient",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700000001",
        )
        self.viewer = User.objects.create_user(
            username="blood_req_viewer",
            password="StrongPass123!",
            role_name="viewer",
        )
        self.donor_creator = User.objects.create_user(
            username="blood_req_donor_creator",
            password="StrongPass123!",
            role_name="donor",
            phone="0700000099",
        )
        self.client.force_authenticate(user=self.recipient_user)

        self.hospital = Hospital.objects.create(
            name="City Hospital",
            phone="0700100001",
            province="Kabul",
            city="Kabul",
            latitude="34.555300",
            longitude="69.207500",
        )
        self.recipient = Recipient.objects.create(
            user=self.recipient_user,
            full_name="Recipient One",
            phone="0700000001",
            required_blood_group="O+",
            hospital=self.hospital,
            emergency_level="urgent",
        )

    def _create_donor(self, **kwargs):
        user = User.objects.create_user(
            username=f"donor-user-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="donor",
            phone=f"0701{Donor.objects.count() + 100001}",
        )
        payload = {
            "first_name": "Donor",
            "last_name": "One",
            "phone": user.phone,
            "user": user,
            "blood_group": "O+",
            "status": "active",
            "latitude": Decimal("34.556000"),
            "longitude": Decimal("69.207700"),
            "last_donation_date": timezone.localdate() - timedelta(days=200),
        }
        payload.update(kwargs)
        return Donor.objects.create(**payload)

    def _create_payload(self, **kwargs):
        payload = {
            "hospital": self.hospital.id,
            "blood_group": "O+",
            "units_needed": 2,
            "request_type": "critical",
            "auto_match_enabled": True,
            "location_lat": "34.555300",
            "location_lon": "69.207500",
            "is_verified": False,
            "medical_report": sample_pdf(),
            "prescription_image": sample_image(),
            "emergency_proof": sample_pdf("proof.pdf"),
        }
        payload.update(kwargs)
        return payload

    def test_create_sets_defaults_and_runs_auto_match(self):
        self._create_donor()
        self._create_donor(
            phone="0700999999",
            latitude=Decimal("35.555000"),
            longitude=Decimal("70.207000"),
        )

        response = self.client.post(self.base_url, self._create_payload(), format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        request_id = response.data["id"]
        self.client.post(f"{self.base_url}{request_id}/run-auto-match/", {}, format="json")
        obj = BloodRequest.objects.get(pk=request_id)
        self.assertEqual(obj.status, "pending")
        self.assertIsNone(obj.assigned_donor_id)
        self.assertTrue(obj.is_verified)
        self.assertTrue(obj.is_emergency)
        self.assertEqual(obj.estimated_time_to_fulfill, 60)
        self.assertIsNotNone(obj.response_deadline)
        self.assertEqual(obj.nearby_donors_count, 1)
        self.assertEqual(obj.total_notified_donors, 1)
        self.assertEqual(Donation.objects.filter(request=obj, status="pending").count(), 1)
        self.assertEqual(BloodRequestNotification.objects.filter(blood_request=obj).count(), 1)
        self.assertTrue(bool(obj.medical_report))
        self.assertTrue(bool(obj.emergency_proof))

    def test_create_with_required_fields_only_uses_hospital_coordinates(self):
        response = self.client.post(
            self.base_url,
            {
                "hospital": self.hospital.id,
                "blood_group": "O+",
                "units_needed": 1,
                "request_type": "urgent",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        obj = BloodRequest.objects.get(pk=response.data["id"])
        self.assertEqual(obj.recipient_id, self.recipient.id)
        self.assertEqual(str(obj.location_lat), "34.555300")
        self.assertEqual(str(obj.location_lon), "69.207500")
        self.assertEqual(obj.request_type, "urgent")

    def test_create_accepts_only_supported_unit_choices(self):
        for units in [1, 1.5, 2]:
            with self.subTest(units=units):
                response = self.client.post(
                    self.base_url,
                    {
                        "hospital": self.hospital.id,
                        "blood_group": "O+",
                        "units_needed": units,
                        "request_type": "urgent",
                    },
                    format="json",
                )

                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                self.assertEqual(Decimal(str(response.data["units_needed"])), Decimal(str(units)))

    def test_create_rejects_unsupported_unit_choices(self):
        for units in [0, 3, 1.2]:
            with self.subTest(units=units):
                response = self.client.post(
                    self.base_url,
                    {
                        "hospital": self.hospital.id,
                        "blood_group": "O+",
                        "units_needed": units,
                        "request_type": "urgent",
                    },
                    format="json",
                )

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("units_needed", response.data)

    def test_create_rejects_client_supplied_recipient_field(self):
        other_user = User.objects.create_user(
            username="recipient-other",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700000002",
        )
        other_recipient = Recipient.objects.create(
            user=other_user,
            full_name="Recipient Two",
            phone="0700000002",
            required_blood_group="A+",
            hospital=self.hospital,
            emergency_level="normal",
        )
        payload = self._create_payload()
        payload["recipient"] = other_recipient.id
        response = self.client.post(self.base_url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("recipient", response.data)

    def test_auto_match_excludes_donor_without_coordinates(self):
        self._create_donor(latitude=None, longitude=None, phone="0700111111")
        response = self.client.post(self.base_url, self._create_payload(), format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        obj = BloodRequest.objects.get(pk=response.data["id"])
        self.assertEqual(obj.nearby_donors_count, 0)
        self.assertEqual(obj.total_notified_donors, 0)

    def test_recipient_without_profile_is_auto_provisioned_and_can_create_request(self):
        orphan_user = User.objects.create_user(
            username="recipient-no-profile",
            password="StrongPass123!",
            role_name="recipient",
        )
        self.client.force_authenticate(user=orphan_user)
        response = self.client.post(self.base_url, self._create_payload(), format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Recipient.objects.filter(user=orphan_user, deleted_at__isnull=True).exists())

    def test_non_recipient_without_recipient_profile_cannot_create(self):
        self.client.force_authenticate(user=self.donor_creator)
        response = self.client.post(
            self.base_url,
            {
                "hospital": self.hospital.id,
                "blood_group": "O+",
                "units_needed": 2,
                "request_type": "urgent",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_admin_can_create_for_selected_recipient(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.base_url,
            {
                "recipient": self.recipient.id,
                "hospital": self.hospital.id,
                "blood_group": "O+",
                "units_needed": 2,
                "request_type": "critical",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = BloodRequest.objects.get(pk=response.data["id"])
        self.assertEqual(created.recipient_id, self.recipient.id)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False)
    def test_create_runs_auto_match_after_commit_without_queue_delay(self):
        self.client.force_authenticate(user=self.admin)

        with patch("blood_requests.views._run_request_automation_safely") as automation_mock:
            with self.captureOnCommitCallbacks(execute=True) as callbacks:
                response = self.client.post(
                    self.base_url,
                    {
                        "recipient": self.recipient.id,
                        "hospital": self.hospital.id,
                        "blood_group": "O+",
                        "units_needed": 1,
                        "request_type": "urgent",
                        "auto_match_enabled": True,
                    },
                    format="json",
                )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertGreaterEqual(len(callbacks), 1)
        automation_mock.assert_called_once_with(response.data["id"])

    def test_recipients_lookup_endpoint_supports_search(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"{self.base_url}recipients/", {"search": "Recipient One"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_manual_assign_endpoint_is_unavailable(self):
        self.client.force_authenticate(user=self.admin)
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=3),
        )
        donor = self._create_donor(phone="0700222222")

        response = self.client.patch(
            f"{self.base_url}{request_obj.id}/assign-donor/",
            {"donor_id": donor.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_pending_update_cannot_save_inactive_request(self):
        self.client.force_authenticate(user=self.admin)
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=3),
            status="pending",
            is_active=True,
        )

        response = self.client.patch(
            f"{self.base_url}{request_obj.id}/",
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_active"])
        request_obj.refresh_from_db()
        self.assertEqual(request_obj.status, "pending")
        self.assertTrue(request_obj.is_active)

    def test_matched_to_completed_transition(self):
        self.client.force_authenticate(user=self.admin)
        donor = self._create_donor(phone="0700333333")
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=3),
            status="matched",
            assigned_donor=donor,
            matched_at=timezone.now(),
        )

        complete_response = self.client.patch(
            f"{self.base_url}{request_obj.id}/complete/",
            {},
            format="json",
        )
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data["status"], "completed")
        self.assertFalse(complete_response.data["is_active"])
        donor.refresh_from_db()
        self.assertEqual(donor.last_donation_date, timezone.localdate())
        self.assertEqual(donor.status, "inactive")

    def test_recipient_can_mark_own_matched_request_completed(self):
        self.client.force_authenticate(user=self.recipient_user)
        donor = self._create_donor(phone="0700333334")
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=3),
            status="matched",
            assigned_donor=donor,
            matched_at=timezone.now(),
        )

        complete_response = self.client.patch(
            f"{self.base_url}{request_obj.id}/complete/",
            {},
            format="json",
        )

        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data["status"], "completed")
        self.assertFalse(complete_response.data["is_active"])

    def test_cancel_sets_terminal_state(self):
        self.client.force_authenticate(user=self.admin)
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="normal",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=4),
        )
        response = self.client.patch(
            f"{self.base_url}{request_obj.id}/cancel/",
            {"cancelled_by": "admin", "rejection_reason": "Duplicate request"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelled")
        self.assertEqual(response.data["cancelled_by"], "admin")
        self.assertFalse(response.data["is_active"])

    def test_verify_and_notifications_endpoints(self):
        self.client.force_authenticate(user=self.recipient_user)
        self._create_donor(phone="0700444441")
        create_response = self.client.post(self.base_url, self._create_payload(), format="multipart")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        request_id = create_response.data["id"]

        self.client.force_authenticate(user=self.admin)
        verify_response = self.client.patch(
            f"{self.base_url}{request_id}/verify/",
            {"is_verified": True},
            format="json",
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_response.data["is_verified"])

        self.client.post(f"{self.base_url}{request_id}/run-auto-match/", {}, format="json")

        notifications_response = self.client.get(f"{self.base_url}{request_id}/notifications/")
        self.assertEqual(notifications_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(notifications_response.data), 1)

    def test_recipient_create_triggers_admin_and_donor_notifications(self):
        donor = self._create_donor(phone="0700555511")
        self.client.force_authenticate(user=self.recipient_user)

        response = self.client.post(
            self.base_url,
            {
                "hospital": self.hospital.id,
                "blood_group": donor.blood_group,
                "units_needed": 1,
                "request_type": "urgent",
                "auto_match_enabled": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data["id"]

        donor_rows = Notification.objects.filter(
            user_id=donor.user_id,
            event_key="blood_request_created",
            request_id=request_id,
            sent_via="in_app",
            hidden_at__isnull=True,
            deleted_at__isnull=True,
        )
        admin_rows = Notification.objects.filter(
            user=self.admin,
            event_key="blood_request_created",
            request_id=request_id,
            sent_via="in_app",
            hidden_at__isnull=True,
            deleted_at__isnull=True,
        )

        self.assertGreaterEqual(donor_rows.count(), 1)
        self.assertGreaterEqual(admin_rows.count(), 1)
        self.assertTrue(all(item.status == "delivered" for item in donor_rows))
        self.assertTrue(all(item.status == "delivered" for item in admin_rows))

    def test_recipient_create_delivers_realtime_event_to_connected_donor(self):
        donor = self._create_donor(phone="0700555522")
        application = ProtocolTypeRouter(
            {
                "websocket": JwtAuthMiddleware(URLRouter(websocket_urlpatterns)),
            }
        )
        token = str(AccessToken.for_user(donor.user))
        communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
        connected, _ = async_to_sync(communicator.connect)()
        self.assertTrue(connected)

        self.client.force_authenticate(user=self.recipient_user)
        response = self.client.post(
            self.base_url,
            {
                "hospital": self.hospital.id,
                "blood_group": donor.blood_group,
                "units_needed": 1,
                "request_type": "urgent",
                "auto_match_enabled": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = async_to_sync(communicator.receive_json_from)(timeout=3)
        self.assertEqual(payload["event"], "notification.created")
        self.assertEqual(payload["data"]["event_key"], "blood_request_created")
        self.assertEqual(payload["data"]["request_id"], response.data["id"])
        self.assertEqual(payload["data"]["metadata"]["blood_group"], donor.blood_group)
        self.assertEqual(payload["data"]["metadata"]["request_type"], "urgent")

        async_to_sync(communicator.disconnect)()

    def test_auto_match_notifications_respect_configured_radius(self):
        update_section(
            "auto_matching",
            {"max_distance_km": 10, "max_candidates_to_notify": 50},
            user=self.admin,
        )
        near_donor = self._create_donor(phone="0700666611")
        outside_radius = self._create_donor(
            phone="0700666612",
            latitude=Decimal("34.700000"),
            longitude=Decimal("69.207500"),
        )
        self.client.force_authenticate(user=self.recipient_user)

        response = self.client.post(
            self.base_url,
            {
                "hospital": self.hospital.id,
                "blood_group": "O+",
                "units_needed": 1,
                "request_type": "urgent",
                "auto_match_enabled": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data["id"]

        self.client.force_authenticate(user=self.admin)
        self.client.post(f"{self.base_url}{request_id}/run-auto-match/", {}, format="json")

        from .models import BloodRequestNotification

        notified_ids = set(
            BloodRequestNotification.objects.filter(blood_request_id=request_id).values_list("donor_id", flat=True)
        )
        self.assertIn(near_donor.id, notified_ids)
        self.assertNotIn(outside_radius.id, notified_ids)

    def test_rerunning_auto_match_does_not_duplicate_donor_alerts(self):
        donor = self._create_donor(phone="0700777711")
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            auto_match_enabled=True,
            location_lat="34.555300",
            location_lon="69.207500",
            response_deadline=timezone.now() + timedelta(hours=3),
        )

        first = run_request_automation(request_obj.id)
        second = run_request_automation(request_obj.id)

        self.assertEqual(first["status"], "ok")
        self.assertEqual(second["status"], "ok")
        self.assertEqual(BloodRequestNotification.objects.filter(blood_request=request_obj, donor=donor).count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                user=donor.user,
                event_key="blood_request_created",
                request=request_obj,
                hidden_at__isnull=True,
                deleted_at__isnull=True,
            ).count(),
            1,
        )

    def test_auto_match_after_request_is_matched_does_not_requeue_donors(self):
        donor_a = self._create_donor(phone="0700888811")
        donor_b = self._create_donor(phone="0700888812", latitude=Decimal("34.557000"))
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            auto_match_enabled=True,
            location_lat="34.555300",
            location_lon="69.207500",
            response_deadline=timezone.now() + timedelta(hours=3),
            status="matched",
            assigned_donor=donor_a,
        )
        accepted = Donation.objects.create(
            request=request_obj,
            donor=donor_a,
            status="accepted",
            distance_km=Decimal("0.10"),
            estimated_arrival_time=5,
            notified_at=timezone.now() - timedelta(minutes=4),
            responded_at=timezone.now() - timedelta(minutes=1),
            is_primary=True,
        )
        expired = Donation.objects.create(
            request=request_obj,
            donor=donor_b,
            status="expired",
            distance_km=Decimal("0.20"),
            estimated_arrival_time=8,
            notified_at=timezone.now() - timedelta(minutes=4),
            responded_at=timezone.now() - timedelta(minutes=1),
        )

        result = run_request_automation(request_obj.id)

        self.assertEqual(result["status"], "closed")
        accepted.refresh_from_db()
        expired.refresh_from_db()
        request_obj.refresh_from_db()
        self.assertEqual(request_obj.assigned_donor_id, donor_a.id)
        self.assertEqual(accepted.status, "accepted")
        self.assertTrue(accepted.is_primary)
        self.assertEqual(expired.status, "expired")
        self.assertFalse(expired.is_primary)
        self.assertFalse(
            BloodRequestNotification.objects.filter(
                blood_request=request_obj,
                donor=donor_b,
                response_status="pending",
            ).exists()
        )

    def test_viewer_cannot_mutate(self):
        permission = Permission.objects.get(module="blood_requests", action="add")
        UserPermission.objects.create(user=self.viewer, permission=permission, allow=False)
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(self.base_url, self._create_payload(), format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_soft_deletes_request(self):
        self.client.force_authenticate(user=self.admin)
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=2,
            request_type="normal",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=8),
        )
        delete_response = self.client.delete(f"{self.base_url}{request_obj.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        request_obj.refresh_from_db()
        self.assertIsNotNone(request_obj.deleted_at)

    def test_recipient_can_delete_own_request(self):
        self.client.force_authenticate(user=self.recipient_user)
        request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="normal",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=8),
        )

        delete_response = self.client.delete(f"{self.base_url}{request_obj.id}/")

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        request_obj.refresh_from_db()
        self.assertIsNotNone(request_obj.deleted_at)

    def test_recipient_cannot_delete_another_recipients_request(self):
        other_user = User.objects.create_user(
            username="other-recipient-owner",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700000022",
        )
        other_recipient = Recipient.objects.create(
            user=other_user,
            full_name="Other Recipient",
            phone="0700000022",
            required_blood_group="A+",
            hospital=self.hospital,
            emergency_level="normal",
        )
        request_obj = BloodRequest.objects.create(
            recipient=other_recipient,
            hospital=self.hospital,
            blood_group="A+",
            units_needed=1,
            request_type="normal",
            location_lat="34.555300",
            location_lon="69.207500",
            auto_match_enabled=False,
            response_deadline=timezone.now() + timedelta(hours=8),
        )

        self.client.force_authenticate(user=self.recipient_user)
        delete_response = self.client.delete(f"{self.base_url}{request_obj.id}/")

        self.assertEqual(delete_response.status_code, status.HTTP_404_NOT_FOUND)
        request_obj.refresh_from_db()
        self.assertIsNone(request_obj.deleted_at)
