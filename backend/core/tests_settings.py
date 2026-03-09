import os
from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission


class SettingsApiTests(APITestCase):
    base_url = "/api/core/settings/"

    @classmethod
    def setUpTestData(cls):
        view_perm, _ = Permission.objects.get_or_create(
            module="settings",
            action="view",
            defaults={"description": "Can view settings"},
        )
        change_perm, _ = Permission.objects.get_or_create(
            module="settings",
            action="change",
            defaults={"description": "Can change settings"},
        )

        RolePermission.objects.get_or_create(role_name="admin", permission=view_perm)
        RolePermission.objects.get_or_create(role_name="admin", permission=change_perm)
        RolePermission.objects.get_or_create(role_name="receptionist", permission=view_perm)
        RolePermission.objects.get_or_create(role_name="viewer", permission=view_perm)

    def setUp(self):
        self.admin = User.objects.create_user(
            username=f"settings-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
            email="admin@example.com",
        )
        self.receptionist = User.objects.create_user(
            username=f"settings-rec-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="receptionist",
            email="rec@example.com",
        )

    def test_get_general_defaults_when_empty(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(f"{self.base_url}general/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("organization_name", response.data)
        self.assertIn("maintenance_mode", response.data)

    def test_admin_can_update_general_and_read_back(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "organization_name": "Blood Center",
            "support_email": "support@example.com",
            "maintenance_mode": True,
        }
        update_response = self.client.put(f"{self.base_url}general/", payload, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        read_response = self.client.get(f"{self.base_url}general/")
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.assertEqual(read_response.data["organization_name"], "Blood Center")
        self.assertTrue(read_response.data["maintenance_mode"])

    def test_notification_secrets_are_masked(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            f"{self.base_url}notifications/",
            {
                "smtp_host": "smtp.example.com",
                "smtp_password": "super-secret-password",
                "sms_account_sid": "AC123456",
                "sms_auth_token": "token-abc",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        read_response = self.client.get(f"{self.base_url}notifications/")
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.assertEqual(read_response.data["smtp_password"], "")
        self.assertTrue(read_response.data["has_smtp_password"])
        self.assertIsNotNone(read_response.data["smtp_password_masked"])

    @patch.dict(os.environ, {"EMAIL_HOST_PASSWORD": "env-secret"}, clear=False)
    def test_notification_env_secret_override(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(f"{self.base_url}notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["has_smtp_password"])
        self.assertEqual(response.data["smtp_password"], "")

    def test_receptionist_can_view_but_cannot_update(self):
        self.client.force_authenticate(self.receptionist)

        view_response = self.client.get(f"{self.base_url}general/")
        self.assertEqual(view_response.status_code, status.HTTP_200_OK)

        update_response = self.client.put(
            f"{self.base_url}general/",
            {"organization_name": "Should fail"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("django.core.mail.send_mail")
    def test_test_email_endpoint(self, send_mail_mock):
        self.client.force_authenticate(self.admin)
        send_mail_mock.return_value = 1

        response = self.client.post(f"{self.base_url}notifications/test-email/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
