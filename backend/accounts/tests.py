import json

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from core.models import Settings


class AuthSecuritySettingsTests(APITestCase):
    login_url = "/api/accounts/auth/login/"

    def setUp(self):
        self.user = User.objects.create_user(
            username="lockout-user",
            password="StrongPass123!",
            role_name="viewer",
            email="lockout@example.com",
        )

    def test_login_lockout_uses_security_settings(self):
        Settings.set_setting(
            key="settings.security",
            value=json.dumps(
                {
                    "password_min_length": 8,
                    "password_require_uppercase": True,
                    "password_require_number": True,
                    "password_require_special_char": False,
                    "max_login_attempts": 3,
                    "lockout_minutes": 1,
                    "session_timeout_minutes": 30,
                    "force_logout_on_password_change": True,
                }
            ),
            setting_type="json",
            category="security",
            description="Security settings",
        )

        for _ in range(2):
            response = self.client.post(
                self.login_url,
                {"username": self.user.username, "password": "wrong-password"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        lock_response = self.client.post(
            self.login_url,
            {"username": self.user.username, "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(lock_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(lock_response.data.get("attempts_remaining"), 0)
