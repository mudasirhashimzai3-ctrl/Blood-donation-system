import shutil
import tempfile
from datetime import timedelta
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User, UserPermission
from core.models import Permission
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient

from .models import BloodRequest


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
        for action in ["view", "add", "change"]:
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
            "last_donation_date": timezone.localdate() - timedelta(days=60),
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
        self.assertTrue(obj.is_verified)
        self.assertTrue(obj.is_emergency)
        self.assertEqual(obj.estimated_time_to_fulfill, 60)
        self.assertIsNotNone(obj.response_deadline)
        self.assertEqual(obj.nearby_donors_count, 1)
        self.assertEqual(obj.total_notified_donors, 1)
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

    def test_recipients_lookup_endpoint_supports_search(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"{self.base_url}recipients/", {"search": "Recipient One"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_assign_rejects_donor_outside_radius_or_cooldown(self):
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
        far_donor = self._create_donor(
            phone="0700222222",
            latitude=Decimal("40.000000"),
            longitude=Decimal("75.000000"),
        )
        cooldown_donor = self._create_donor(
            phone="0700222223",
            last_donation_date=timezone.localdate() - timedelta(days=10),
        )

        far_response = self.client.patch(
            f"{self.base_url}{request_obj.id}/assign-donor/",
            {"donor_id": far_donor.id},
            format="json",
        )
        self.assertEqual(far_response.status_code, status.HTTP_400_BAD_REQUEST)

        cooldown_response = self.client.patch(
            f"{self.base_url}{request_obj.id}/assign-donor/",
            {"donor_id": cooldown_donor.id},
            format="json",
        )
        self.assertEqual(cooldown_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pending_to_matched_to_completed_transition(self):
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
        )

        assign_response = self.client.patch(
            f"{self.base_url}{request_obj.id}/assign-donor/",
            {"donor_id": donor.id},
            format="json",
        )
        self.assertEqual(assign_response.status_code, status.HTTP_200_OK)
        self.assertEqual(assign_response.data["status"], "matched")

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
