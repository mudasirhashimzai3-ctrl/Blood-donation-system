from unittest.mock import patch

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from notifications.models import Notification
from notifications.services.factory import create_notifications


class NotificationApiTests(APITestCase):
    base_url = "/api/notifications/"

    @classmethod
    def setUpTestData(cls):
        actions = ["view", "add", "change", "delete"]
        permissions = {}
        for action in actions:
            permission, _ = Permission.objects.get_or_create(
                module="notifications",
                action=action,
                defaults={"description": f"Can {action} notifications"},
            )
            permissions[action] = permission

        for action in actions:
            RolePermission.objects.get_or_create(role_name="admin", permission=permissions[action])
        for action in ["view"]:
            RolePermission.objects.get_or_create(role_name="viewer", permission=permissions[action])
        for action in ["view", "add", "change"]:
            RolePermission.objects.get_or_create(role_name="receptionist", permission=permissions[action])

    def setUp(self):
        self.admin = User.objects.create_user(
            username=f"notif-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
            email="admin@example.com",
        )
        self.viewer = User.objects.create_user(
            username=f"notif-viewer-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="viewer",
            email="viewer@example.com",
        )
        self.client.force_authenticate(user=self.admin)

        self.admin_notification = Notification.objects.create(
            user=self.admin,
            user_type="admin",
            event_key="system_alert",
            type="system",
            title="Admin alert",
            message="Admin only",
            sent_via="in_app",
            status="delivered",
        )
        self.viewer_notification = Notification.objects.create(
            user=self.viewer,
            user_type="viewer",
            event_key="system_alert",
            type="system",
            title="Viewer alert",
            message="Viewer only",
            sent_via="in_app",
            status="delivered",
        )

    def test_list_scopes_by_user(self):
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.admin_notification.id)

    def test_mark_read_and_mark_all(self):
        second = Notification.objects.create(
            user=self.admin,
            user_type="admin",
            event_key="system_alert",
            type="system",
            title="Unread",
            message="Unread message",
            sent_via="in_app",
            status="delivered",
        )

        unread_before = self.client.get(f"{self.base_url}unread-count/")
        self.assertEqual(unread_before.status_code, status.HTTP_200_OK)
        self.assertEqual(unread_before.data["count"], 2)

        read_response = self.client.patch(
            f"{self.base_url}{self.admin_notification.id}/read/",
            {"is_read": True},
            format="json",
        )
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.admin_notification.refresh_from_db()
        self.assertTrue(self.admin_notification.is_read)
        self.assertIsNotNone(self.admin_notification.read_at)

        mark_all_response = self.client.post(f"{self.base_url}mark-all-read/", {}, format="json")
        self.assertEqual(mark_all_response.status_code, status.HTTP_200_OK)
        second.refresh_from_db()
        self.assertTrue(second.is_read)

    def test_soft_delete_hides_notification(self):
        response = self.client.delete(f"{self.base_url}{self.admin_notification.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.admin_notification.refresh_from_db()
        self.assertIsNotNone(self.admin_notification.hidden_at)

        list_response = self.client.get(self.base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 0)

    def test_sms_callback_updates_status(self):
        notification = Notification.objects.create(
            user=self.admin,
            user_type="admin",
            event_key="system_alert",
            type="system",
            title="SMS",
            message="SMS body",
            sent_via="sms",
            status="sent",
            provider_message_id="SM123456",
        )

        callback_response = self.client.post(
            "/api/notifications/sms-callback/",
            {"MessageSid": "SM123456", "MessageStatus": "delivered"},
            format="json",
        )
        self.assertEqual(callback_response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertEqual(notification.status, "delivered")
        self.assertEqual(notification.provider_status, "delivered")

    @patch("notifications.services.factory._dispatch_async")
    def test_create_notifications_role_expansion_and_channels(self, mock_dispatch):
        rows = create_notifications(
            event_key="system_alert",
            type="system",
            title="Role Alert",
            message="Role scoped",
            sent_via=["in_app", "email"],
            role_names=["admin"],
            dedupe_key=f"role-alert-{timezone.now().isoformat()}",
        )
        self.assertGreaterEqual(len(rows), 2)
        channels = {item.sent_via for item in rows}
        self.assertTrue({"in_app", "email"}.issubset(channels))
        self.assertTrue(all(item.user_type == "admin" for item in rows))
        self.assertEqual(mock_dispatch.call_count, len(rows))
