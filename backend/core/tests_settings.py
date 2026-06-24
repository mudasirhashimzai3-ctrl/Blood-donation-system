import os
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from accounts.models import RolePermission, User
from core.models import BackupRecord, Permission
from core.models import SettingAuditLog


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
        RolePermission.objects.get_or_create(role_name="recipient", permission=view_perm)
        RolePermission.objects.get_or_create(role_name="donor", permission=view_perm)

    def setUp(self):
        self.admin = User.objects.create_user(
            username=f"settings-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
            email="admin@example.com",
        )
        self.recipient = User.objects.create_user(
            username=f"settings-rec-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="recipient",
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
            "support_phone": "0700000300",
            "maintenance_mode": True,
        }
        update_response = self.client.put(f"{self.base_url}general/", payload, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        read_response = self.client.get(f"{self.base_url}general/")
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.assertEqual(read_response.data["organization_name"], "Blood Center")
        self.assertEqual(read_response.data["support_phone"], "0700000300")
        self.assertTrue(read_response.data["maintenance_mode"])

    def test_general_settings_reject_invalid_support_phone(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            f"{self.base_url}general/",
            {
                "organization_name": "Blood Center",
                "support_email": "support@example.com",
                "support_phone": "07000003A0",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("support_phone", response.data)

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

    def test_recipient_cannot_access_admin_settings(self):
        self.client.force_authenticate(self.recipient)

        view_response = self.client.get(f"{self.base_url}general/")
        self.assertEqual(view_response.status_code, status.HTTP_403_FORBIDDEN)

        update_response = self.client.put(
            f"{self.base_url}general/",
            {"organization_name": "Should fail"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_roles_defaults_when_empty(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(f"{self.base_url}user-roles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("allow_user_invite", response.data)
        self.assertNotIn("default_new_user_role", response.data)

    def test_admin_can_update_user_roles_and_writes_audit_log(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "allow_user_invite": False,
            "allow_role_editing": True,
        }
        response = self.client.put(f"{self.base_url}user-roles/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["allow_user_invite"])
        self.assertTrue(response.data["allow_role_editing"])
        self.assertNotIn("default_new_user_role", response.data)

        self.assertTrue(SettingAuditLog.objects.filter(section="user_roles").exists())

    def test_admin_can_update_auto_matching_radius(self):
        self.client.force_authenticate(self.admin)
        response = self.client.put(
            f"{self.base_url}auto-matching/",
            {
                "enabled": True,
                "max_distance_km": 20,
                "prioritize_rare_blood_groups": True,
                "prioritize_recently_active_donors": True,
                "max_candidates_to_notify": 25,
                "retry_interval_minutes": 10,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["max_distance_km"], 20)

        read_response = self.client.get(f"{self.base_url}auto-matching/")
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.assertEqual(read_response.data["max_distance_km"], 20)

    def test_auto_matching_rejects_unsupported_radius(self):
        self.client.force_authenticate(self.admin)
        response = self.client.put(
            f"{self.base_url}auto-matching/",
            {"max_distance_km": 15},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_role_permission_matrix(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(f"{self.base_url}user-roles/permissions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("roles", response.data)
        self.assertIn("modules", response.data)
        self.assertIn("actions", response.data)
        self.assertIn("matrix", response.data)
        self.assertIn("admin", response.data["roles"])
        self.assertIn("settings", response.data["modules"])

    def test_admin_can_update_role_permission_matrix(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "matrix": [
                {"role_name": "admin", "module": "settings", "actions": ["view", "change"]},
                {"role_name": "admin", "module": "users", "actions": ["view", "add", "change", "delete"]},
                {"role_name": "recipient", "module": "settings", "actions": ["view"]},
            ]
        }
        response = self.client.put(
            f"{self.base_url}user-roles/permissions/",
            payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        matrix = response.data["matrix"]
        users_row = next((item for item in matrix if item["role_name"] == "admin" and item["module"] == "users"), None)
        self.assertIsNotNone(users_row)
        self.assertIn("delete", users_row["actions"])

    def test_reject_invalid_role_permission_payload(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "matrix": [
                {"role_name": "invalid-role", "module": "settings", "actions": ["view", "change"]},
            ]
        }
        response = self.client.put(
            f"{self.base_url}user-roles/permissions/",
            payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_admin_cannot_update_user_role_permissions(self):
        self.client.force_authenticate(self.recipient)
        payload = {
            "matrix": [
                {"role_name": "admin", "module": "settings", "actions": ["view", "change"]},
            ]
        }
        response = self.client.put(
            f"{self.base_url}user-roles/permissions/",
            payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_permissions_remain_full_even_if_payload_restricts_admin(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "matrix": [
                {"role_name": "admin", "module": "settings", "actions": ["view"]},
            ]
        }
        response = self.client.put(
            f"{self.base_url}user-roles/permissions/",
            payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        settings_admin_row = next(
            (
                item
                for item in response.data["matrix"]
                if item["role_name"] == "admin" and item["module"] == "settings"
            ),
            None,
        )
        self.assertIsNotNone(settings_admin_row)
        self.assertEqual(
            set(settings_admin_row["actions"]),
            {"view", "add", "change", "delete", "all"},
        )

    @patch("django.core.mail.send_mail")
    def test_test_email_endpoint(self, send_mail_mock):
        self.client.force_authenticate(self.admin)
        send_mail_mock.return_value = 1

        response = self.client.post(f"{self.base_url}notifications/test-email/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)


class BackupRestoreApiTests(APITransactionTestCase):
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
        RolePermission.objects.get_or_create(role_name="recipient", permission=view_perm)

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        root = Path(self.temp_dir.name)
        self.settings_override = override_settings(
            BACKUP_ROOT=root / "backups",
            MEDIA_ROOT=root / "media",
        )
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)

        self.admin = User.objects.create_user(
            username=f"backup-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
            email="backup-admin@example.com",
        )
        self.recipient = User.objects.create_user(
            username=f"backup-rec-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="recipient",
            email="backup-rec@example.com",
        )

    def test_admin_can_create_manual_backup(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(f"{self.base_url}backup-restore/manual-backup/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["backup_type"], "manual")
        self.assertEqual(response.data["status"], "completed")
        self.assertTrue(BackupRecord.objects.filter(status="completed").exists())

    def test_non_admin_cannot_access_backup_restore(self):
        self.client.force_authenticate(self.recipient)

        response = self.client.get(f"{self.base_url}backup-restore/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_backup_history_lists_created_records(self):
        self.client.force_authenticate(self.admin)
        self.client.post(f"{self.base_url}backup-restore/manual-backup/", {}, format="json")

        response = self.client.get(f"{self.base_url}backup-restore/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("settings", response.data)
        self.assertIn("last_backup", response.data)
        self.assertEqual(len(response.data["history"]), 1)

    def test_download_returns_zip_file(self):
        self.client.force_authenticate(self.admin)
        create_response = self.client.post(f"{self.base_url}backup-restore/manual-backup/", {}, format="json")
        backup_id = create_response.data["id"]

        response = self.client.get(f"{self.base_url}backup-restore/backups/{backup_id}/download/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/zip")
        response.close()

    def test_restore_creates_pre_restore_snapshot(self):
        self.client.force_authenticate(self.admin)
        create_response = self.client.post(f"{self.base_url}backup-restore/manual-backup/", {}, format="json")
        backup_id = create_response.data["id"]

        response = self.client.post(f"{self.base_url}backup-restore/backups/{backup_id}/restore/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(BackupRecord.objects.filter(backup_type="pre_restore", status="completed").exists())

    @patch("core.services.backup_service.call_command", side_effect=Exception("dump failed"))
    def test_failed_backup_records_error_status(self, _call_command):
        self.client.force_authenticate(self.admin)

        response = self.client.post(f"{self.base_url}backup-restore/manual-backup/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        record = BackupRecord.objects.get()
        self.assertEqual(record.status, "failed")
        self.assertIn("dump failed", record.error_message)

    def test_admin_can_update_backup_schedule_settings(self):
        self.client.force_authenticate(self.admin)
        payload = {
            "daily_enabled": False,
            "weekly_enabled": True,
            "monthly_enabled": False,
            "daily_retention_count": 10,
            "weekly_retention_count": 8,
            "monthly_retention_count": 6,
        }

        response = self.client.put(f"{self.base_url}backup-restore/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["daily_enabled"])
        self.assertEqual(response.data["weekly_retention_count"], 8)

    def test_non_admin_cannot_update_backup_schedule_settings(self):
        self.client.force_authenticate(self.recipient)

        response = self.client.put(
            f"{self.base_url}backup-restore/",
            {"daily_enabled": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
