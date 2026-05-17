from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient


class RoleAccessEnforcementTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="role-admin",
            password="StrongPass123!",
            role_name="admin",
            email="role-admin@example.com",
            phone="0700000200",
        )
        self.donor_user = User.objects.create_user(
            username="role-donor",
            password="StrongPass123!",
            role_name="donor",
            email="role-donor@example.com",
            phone="0700000201",
        )
        self.recipient_user = User.objects.create_user(
            username="role-recipient",
            password="StrongPass123!",
            role_name="recipient",
            email="role-recipient@example.com",
            phone="0700000202",
        )

        self.hospital = Hospital.objects.create(
            name="Role Access Hospital",
            city="Kabul",
            province="Kabul",
            latitude=34.555300,
            longitude=69.207500,
        )

        self.donor = Donor.objects.create(
            user=self.donor_user,
            first_name="Role",
            last_name="Donor",
            phone=self.donor_user.phone,
            email=self.donor_user.email,
            blood_group="O+",
            status="active",
            latitude=34.555300,
            longitude=69.207500,
        )
        self.recipient = Recipient.objects.create(
            user=self.recipient_user,
            full_name="Role Recipient",
            email=self.recipient_user.email,
            phone=self.recipient_user.phone,
            hospital=self.hospital,
            emergency_level="normal",
        )

    def _grant_role_permission(self, role_name: str, module: str, action: str = "view"):
        permission, _ = Permission.objects.get_or_create(
            module=module,
            action=action,
            defaults={"description": f"{module}.{action}"},
        )
        RolePermission.objects.get_or_create(role_name=role_name, permission=permission)

    def test_donor_and_recipient_cannot_access_admin_settings_even_with_permission(self):
        self._grant_role_permission("donor", "settings", "view")
        self._grant_role_permission("recipient", "settings", "view")

        self.client.force_authenticate(self.donor_user)
        donor_response = self.client.get("/api/core/settings/overview/")
        self.assertEqual(donor_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.recipient_user)
        recipient_response = self.client.get("/api/core/settings/overview/")
        self.assertEqual(recipient_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin_user)
        admin_response = self.client.get("/api/core/settings/overview/")
        self.assertEqual(admin_response.status_code, status.HTTP_200_OK)

    def test_cross_role_dataset_enumeration_is_blocked_even_with_view_permissions(self):
        self._grant_role_permission("donor", "donors", "view")
        self._grant_role_permission("donor", "recipients", "view")
        self._grant_role_permission("recipient", "recipients", "view")
        self._grant_role_permission("recipient", "donors", "view")

        self.client.force_authenticate(self.donor_user)
        donor_view_recipients = self.client.get("/api/recipients/")
        self.assertEqual(donor_view_recipients.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_view_recipients.data.get("count"), 0)

        donor_view_donors = self.client.get("/api/donors/")
        self.assertEqual(donor_view_donors.status_code, status.HTTP_200_OK)
        self.assertEqual(donor_view_donors.data.get("count"), 1)

        self.client.force_authenticate(self.recipient_user)
        recipient_view_donors = self.client.get("/api/donors/")
        self.assertEqual(recipient_view_donors.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_view_donors.data.get("count"), 0)

        recipient_view_recipients = self.client.get("/api/recipients/")
        self.assertEqual(recipient_view_recipients.status_code, status.HTTP_200_OK)
        self.assertEqual(recipient_view_recipients.data.get("count"), 1)
