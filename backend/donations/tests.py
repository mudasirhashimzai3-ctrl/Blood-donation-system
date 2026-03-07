from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from blood_requests.models import BloodRequest
from core.models import Permission
from donations.models import Donation
from donations.tasks import process_due_reminders
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient


class DonationApiTests(APITestCase):
    base_url = "/api/donations/"

    @classmethod
    def setUpTestData(cls):
        modules = ["donations", "blood_requests"]
        actions = ["view", "add", "change", "delete"]

        for module in modules:
            permissions = {}
            for action in actions:
                permission, _ = Permission.objects.get_or_create(
                    module=module,
                    action=action,
                    defaults={"description": f"Can {action} {module}"},
                )
                permissions[action] = permission

            for action in actions:
                RolePermission.objects.get_or_create(role_name="admin", permission=permissions[action])
            RolePermission.objects.get_or_create(role_name="viewer", permission=permissions["view"])
            for action in ["view", "add", "change"]:
                RolePermission.objects.get_or_create(role_name="receptionist", permission=permissions[action])

    def setUp(self):
        self.admin = User.objects.create_user(
            username=f"donation-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
        )
        self.viewer = User.objects.create_user(
            username=f"donation-viewer-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="viewer",
        )
        self.client.force_authenticate(user=self.admin)

        self.hospital = Hospital.objects.create(
            name="Hope Hospital",
            phone=f"0709{Hospital.objects.count() + 1000}",
            city="Kabul",
            latitude="34.555300",
            longitude="69.207500",
            is_active=True,
        )
        self.recipient = Recipient.objects.create(
            full_name="Recipient Donation",
            phone=f"0708{Recipient.objects.count() + 1000}",
            required_blood_group="O+",
            age=35,
            gender="male",
            hospital=self.hospital,
            emergency_level="urgent",
            status="active",
        )
        self.request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=2,
            request_type="urgent",
            priority="high",
            auto_match_enabled=False,
            location_lat="34.555300",
            location_lon="69.207500",
            response_deadline=timezone.now() + timedelta(hours=2),
            status="pending",
        )
        self.donor_a = Donor.objects.create(
            first_name="Donor",
            last_name="A",
            phone=f"0707{Donor.objects.count() + 1000}",
            blood_group="O+",
            status="active",
            latitude=Decimal("34.556000"),
            longitude=Decimal("69.207700"),
            last_donation_date=timezone.localdate() - timedelta(days=90),
        )
        self.donor_b = Donor.objects.create(
            first_name="Donor",
            last_name="B",
            phone=f"0707{Donor.objects.count() + 1000}",
            blood_group="O+",
            status="active",
            latitude=Decimal("34.557000"),
            longitude=Decimal("69.207800"),
            last_donation_date=timezone.localdate() - timedelta(days=120),
        )

    def _create_donation(self, donor, **kwargs):
        payload = {
            "request": self.request_obj,
            "donor": donor,
            "status": "pending",
            "distance_km": Decimal("1.25"),
            "estimated_arrival_time": 8,
            "notified_at": timezone.now() - timedelta(minutes=30),
            "priority_score": Decimal("42.50"),
        }
        payload.update(kwargs)
        return Donation.objects.create(**payload)

    def test_status_transition_and_response_time(self):
        donation = self._create_donation(self.donor_a)
        response = self.client.patch(
            f"{self.base_url}{donation.id}/status/",
            {"status": "accepted"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donation.refresh_from_db()
        self.assertEqual(donation.status, "accepted")
        self.assertIsNotNone(donation.response_time)
        self.assertGreaterEqual(donation.response_time, 0)

        invalid = self.client.patch(
            f"{self.base_url}{donation.id}/status/",
            {"status": "pending"},
            format="json",
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_primary_keeps_single_primary(self):
        first = self._create_donation(self.donor_a)
        second = self._create_donation(self.donor_b, distance_km=Decimal("2.15"))

        first_response = self.client.patch(
            f"{self.base_url}{first.id}/set-primary/",
            {"is_primary": True},
            format="json",
        )
        self.assertEqual(first_response.status_code, status.HTTP_200_OK)

        second_response = self.client.patch(
            f"{self.base_url}{second.id}/set-primary/",
            {"is_primary": True},
            format="json",
        )
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)

        first.refresh_from_db()
        second.refresh_from_db()
        self.assertFalse(first.is_primary)
        self.assertTrue(second.is_primary)

    def test_refresh_estimate_endpoint(self):
        donation = self._create_donation(self.donor_a, distance_km=Decimal("9.99"), estimated_arrival_time=180)
        response = self.client.post(
            f"{self.base_url}{donation.id}/refresh-estimate/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donation.refresh_from_db()
        self.assertNotEqual(donation.distance_km, Decimal("9.99"))
        self.assertIsNotNone(donation.estimated_arrival_time)

    def test_send_reminder_and_scheduler(self):
        self.request_obj.response_deadline = timezone.now() + timedelta(minutes=20)
        self.request_obj.save(update_fields=["response_deadline", "updated_at"])
        donation = self._create_donation(
            self.donor_a,
            notified_at=timezone.now() - timedelta(minutes=15),
        )
        response = self.client.post(
            f"{self.base_url}{donation.id}/send-reminder/",
            {"channels": ["in_app", "sms"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donation.refresh_from_db()
        self.assertEqual(donation.reminder_count, 1)
        self.assertIsNotNone(donation.reminder_sent_at)

        donation.reminder_count = 0
        donation.notified_at = timezone.now() - timedelta(minutes=20)
        donation.save(update_fields=["reminder_count", "notified_at", "updated_at"])
        task_result = process_due_reminders()
        self.assertIn("sent", task_result)

    def test_permissions_and_compat_notifications(self):
        donation = self._create_donation(self.donor_a)
        compatibility = self.client.get(f"/api/blood-requests/{self.request_obj.id}/notifications/")
        self.assertEqual(compatibility.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(compatibility.data), 1)
        self.assertEqual(compatibility.data[0]["donor"], donation.donor_id)

        self.client.force_authenticate(user=self.viewer)
        denied = self.client.patch(
            f"{self.base_url}{donation.id}/status/",
            {"status": "accepted"},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
