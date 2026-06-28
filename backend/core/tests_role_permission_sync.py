from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from blood_requests.models import BloodRequest
from donations.models import Donation
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient


class RolePermissionSyncCommandTests(APITestCase):
    def setUp(self):
        RolePermission.objects.all().delete()

        self.donor_user = User.objects.create_user(
            username="sync-donor",
            password="StrongPass123!",
            role_name="donor",
            email="sync-donor@example.com",
            phone="0700000101",
        )
        self.recipient_user = User.objects.create_user(
            username="sync-recipient",
            password="StrongPass123!",
            role_name="recipient",
            email="sync-recipient@example.com",
            phone="0700000102",
        )

        self.donor = Donor.objects.create(
            user=self.donor_user,
            first_name="Sync",
            last_name="Donor",
            phone=self.donor_user.phone,
            email=self.donor_user.email,
            blood_group="O+",
            status="active",
            latitude=34.555300,
            longitude=69.207500,
        )
        self.hospital = Hospital.objects.create(
            name="Sync General Hospital",
            city="Kabul",
            province="Kabul",
            latitude=34.555300,
            longitude=69.207500,
        )
        self.recipient = Recipient.objects.create(
            user=self.recipient_user,
            full_name="Sync Recipient",
            email=self.recipient_user.email,
            phone=self.recipient_user.phone,
            hospital=self.hospital,
            emergency_level="normal",
        )
        self.request = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="O+",
            units_needed=1,
            request_type="normal",
            location_lat=34.555300,
            location_lon=69.207500,
            status="pending",
            is_active=True,
        )
        self.donation = Donation.objects.create(
            request=self.request,
            donor=self.donor,
            status="pending",
            distance_km=2.5,
            is_primary=True,
        )

    def test_sync_command_is_idempotent_and_seeds_donor_recipient_modules(self):
        call_command("sync_role_permissions", "--quiet")
        first_count = RolePermission.objects.count()
        self.assertGreater(first_count, 0)

        donor_modules = set(
            RolePermission.objects.filter(role_name="donor").values_list(
                "permission__module", flat=True
            )
        )
        recipient_modules = set(
            RolePermission.objects.filter(role_name="recipient").values_list(
                "permission__module", flat=True
            )
        )

        self.assertTrue(
            {"donors", "blood_requests", "donations", "notifications"}.issubset(
                donor_modules
            )
        )
        self.assertTrue(
            {"recipients", "blood_requests", "notifications"}.issubset(
                recipient_modules
            )
        )

        call_command("sync_role_permissions", "--quiet")
        second_count = RolePermission.objects.count()
        self.assertEqual(first_count, second_count)

    def test_seeded_permissions_allow_critical_mobile_endpoints(self):
        call_command("sync_role_permissions", "--quiet")

        self.client.force_authenticate(self.donor_user)
        donor_me = self.client.get("/api/accounts/users/me/")
        donor_dashboard = self.client.get("/api/donors/mobile-dashboard/")
        donor_requests = self.client.get("/api/blood-requests/")
        donor_donations = self.client.get("/api/donations/")
        donor_notifications = self.client.get("/api/notifications/unread-count/")
        donor_respond = self.client.post(
            f"/api/donations/{self.donation.id}/respond/",
            {"action": "decline"},
            format="json",
        )

        self.assertEqual(donor_me.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_dashboard.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_requests.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_donations.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_notifications.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_respond.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(self.recipient_user)
        recipient_me = self.client.get("/api/accounts/users/me/")
        recipient_dashboard = self.client.get("/api/recipients/mobile-dashboard/")
        recipient_requests = self.client.get("/api/blood-requests/")
        recipient_notifications = self.client.get("/api/notifications/unread-count/")
        recipient_mark_all_read = self.client.post(
            "/api/notifications/mark-all-read/",
            {},
            format="json",
        )
        recipient_create_request = self.client.post(
            "/api/blood-requests/",
            {
                "hospital": self.hospital.id,
                "blood_group": "A+",
                "units_needed": 1,
                "request_type": "normal",
                "auto_match_enabled": True,
            },
            format="json",
        )
        recipient_delete_request = self.client.delete(
            f"/api/blood-requests/{self.request.id}/"
        )

        self.assertEqual(recipient_me.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_dashboard.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_requests.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_notifications.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_mark_all_read.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_create_request.status_code, status.HTTP_201_CREATED)
        self.assertEqual(recipient_delete_request.status_code, status.HTTP_204_NO_CONTENT)
