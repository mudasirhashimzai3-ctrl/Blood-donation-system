import json

from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from core.models import Settings
from donors.models import Donor
from recipients.models import Recipient


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
        cache.clear()

        for _ in range(2):
            response = self.client.post(
                self.login_url,
                {"username": self.user.username, "password": "wrong-password", "role": "donor"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        lock_response = self.client.post(
            self.login_url,
            {"username": self.user.username, "password": "wrong-password", "role": "donor"},
            format="json",
        )
        self.assertEqual(lock_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(lock_response.data.get("attempts_remaining"), 0)


class AuthRoleLoginMappingTests(APITestCase):
    login_url = "/api/accounts/auth/login/"

    def setUp(self):
        self.password = "StrongPass123!"
        self.admin = User.objects.create_user(
            username="admin-user",
            password=self.password,
            role_name="admin",
            email="admin@example.com",
        )
        self.viewer = User.objects.create_user(
            username="viewer-user",
            password=self.password,
            role_name="viewer",
            email="viewer@example.com",
        )
        self.receptionist = User.objects.create_user(
            username="reception-user",
            password=self.password,
            role_name="receptionist",
            email="reception@example.com",
        )

    def test_login_accepts_matching_role_selection(self):
        cases = [
            (self.admin.username, "admin"),
            (self.viewer.username, "donor"),
            (self.receptionist.username, "recipient"),
        ]

        for username, role in cases:
            response = self.client.post(
                self.login_url,
                {"username": username, "password": self.password, "role": role},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn("access", response.data)

    def test_login_rejects_role_mismatch_and_tracks_failed_attempts(self):
        response = self.client.post(
            self.login_url,
            {"username": self.viewer.username, "password": self.password, "role": "recipient"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("attempts_remaining"), 4)

        self.viewer.refresh_from_db()
        self.assertEqual(self.viewer.failed_login_attempts, 1)
        self.assertIsNone(self.viewer.account_locked_until)

    def test_login_rejects_missing_role(self):
        response = self.client.post(
            self.login_url,
            {"username": self.viewer.username, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("attempts_remaining"), 4)

        self.viewer.refresh_from_db()
        self.assertEqual(self.viewer.failed_login_attempts, 1)

    def test_login_rejects_invalid_role_value(self):
        response = self.client.post(
            self.login_url,
            {"username": self.viewer.username, "password": self.password, "role": "invalid-role"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("attempts_remaining"), 4)

        self.viewer.refresh_from_db()
        self.assertEqual(self.viewer.failed_login_attempts, 1)


class AuthSignupTests(APITestCase):
    signup_url = "/api/accounts/auth/signup/"
    login_url = "/api/accounts/auth/login/"

    def test_donor_signup_creates_donor_role(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Donor",
                "last_name": "User",
                "username": "donor-signup",
                "email": "donor-signup@example.com",
                "phone": "0700000001",
                "donor_blood_group": "O+",
                "donor_latitude": "34.555300",
                "donor_longitude": "69.207500",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(username="donor-signup")
        self.assertEqual(created.role_name, "donor")
        donor_profile = Donor.objects.get(user=created)
        self.assertEqual(donor_profile.blood_group, "O+")
        self.assertEqual(donor_profile.status, "active")

    def test_recipient_signup_creates_recipient_role(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Recipient",
                "last_name": "User",
                "username": "recipient-signup",
                "email": "recipient-signup@example.com",
                "phone": "0700000002",
                "recipient_required_blood_group": "A+",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "recipient",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(username="recipient-signup")
        self.assertEqual(created.role_name, "recipient")
        recipient_profile = Recipient.objects.get(user=created)
        self.assertEqual(recipient_profile.required_blood_group, "A+")
        self.assertEqual(recipient_profile.status, "active")

    def test_signup_rejects_invalid_role(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Invalid",
                "last_name": "Role",
                "username": "invalid-role-user",
                "email": "invalid-role@example.com",
                "phone": "0700000003",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "invalid",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_rejects_duplicate_username_or_email(self):
        User.objects.create_user(
            username="existing-user",
            email="existing@example.com",
            password="StrongPass123!",
            role_name="viewer",
        )
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Existing",
                "last_name": "Dup",
                "username": "existing-user",
                "email": "existing@example.com",
                "phone": "0700000004",
                "donor_blood_group": "O-",
                "donor_latitude": "34.555300",
                "donor_longitude": "69.207500",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)

    def test_signup_rejects_password_mismatch(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Mismatch",
                "last_name": "User",
                "username": "mismatch-user",
                "email": "mismatch@example.com",
                "phone": "0700000005",
                "recipient_required_blood_group": "B+",
                "password": "StrongPass123!",
                "confirm_password": "WrongPass123!",
                "role": "recipient",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_signup_allows_missing_email(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "No",
                "last_name": "Email",
                "username": "no-email-user",
                "phone": "0700000007",
                "donor_blood_group": "AB+",
                "donor_latitude": "34.555300",
                "donor_longitude": "69.207500",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(username="no-email-user")
        self.assertEqual(created.email, "")

    def test_signup_then_login_with_matching_role(self):
        signup_response = self.client.post(
            self.signup_url,
            {
                "first_name": "Flow",
                "last_name": "User",
                "username": "flow-user",
                "email": "flow@example.com",
                "phone": "0700000006",
                "donor_blood_group": "O+",
                "donor_latitude": "34.555300",
                "donor_longitude": "69.207500",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            self.login_url,
            {
                "username": "flow-user",
                "password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
