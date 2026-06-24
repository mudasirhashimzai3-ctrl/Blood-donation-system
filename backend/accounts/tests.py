import json
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from core.models import Settings
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient


def tiny_gif_file(name="avatar.gif"):
    gif_bytes = (
        b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
        b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x00\x00\x00\x00\x00"
        b"\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b"
    )
    return SimpleUploadedFile(name, gif_bytes, content_type="image/gif")


class UserAvatarApiTests(APITestCase):
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

    def setUp(self):
        self.user = User.objects.create_user(
            username="avatar-user",
            password="StrongPass123!",
            role_name="donor",
        )
        self.other_user = User.objects.create_user(
            username="avatar-other-user",
            password="StrongPass123!",
            role_name="recipient",
        )
        self.client.force_authenticate(user=self.user)

    def test_user_can_upload_avatar(self):
        response = self.client.post(
            f"/api/accounts/users/{self.user.id}/upload-photo/",
            {"photo": tiny_gif_file()},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("avatar_url", response.data)
        self.assertTrue(response.data["avatar_url"])
        self.user.refresh_from_db()
        self.assertTrue(self.user.avatar)

    def test_user_can_delete_avatar(self):
        upload_response = self.client.post(
            f"/api/accounts/users/{self.user.id}/upload-photo/",
            {"photo": tiny_gif_file("delete-me.gif")},
            format="multipart",
        )
        self.assertEqual(upload_response.status_code, status.HTTP_200_OK)

        response = self.client.delete(f"/api/accounts/users/{self.user.id}/delete-photo/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["avatar_url"], "")
        self.user.refresh_from_db()
        self.assertFalse(bool(self.user.avatar))

    def test_avatar_upload_rejects_invalid_or_oversized_file(self):
        invalid_response = self.client.post(
            f"/api/accounts/users/{self.user.id}/upload-photo/",
            {"photo": SimpleUploadedFile("avatar.txt", b"not-image", content_type="text/plain")},
            format="multipart",
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", invalid_response.data)

        too_large_response = self.client.post(
            f"/api/accounts/users/{self.user.id}/upload-photo/",
            {
                "photo": SimpleUploadedFile(
                    "large.jpg",
                    b"a" * (5 * 1024 * 1024 + 1),
                    content_type="image/jpeg",
                )
            },
            format="multipart",
        )
        self.assertEqual(too_large_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photo", too_large_response.data)

    def test_non_admin_cannot_upload_photo_for_another_user(self):
        response = self.client.post(
            f"/api/accounts/users/{self.other_user.id}/upload-photo/",
            {"photo": tiny_gif_file("other.gif")},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_user.refresh_from_db()
        self.assertFalse(bool(self.other_user.avatar))


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

    def test_login_options_includes_x_client_platform_cors_header(self):
        response = self.client.options(
            self.login_url,
            HTTP_ORIGIN="http://localhost:54197",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type,x-client-platform",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        allowed_headers = response.get("access-control-allow-headers", "").lower()
        self.assertIn("x-client-platform", allowed_headers)


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

    def test_mobile_login_blocks_admin_role(self):
        response = self.client.post(
            self.login_url,
            {"username": self.admin.username, "password": self.password, "role": "admin"},
            format="json",
            HTTP_X_CLIENT_PLATFORM="mobile",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("attempts_remaining"), 4)

    def test_admin_login_without_mobile_header_is_allowed(self):
        response = self.client.post(
            self.login_url,
            {"username": self.admin.username, "password": self.password, "role": "admin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


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
                "donor_age": 28,
                "donor_date_of_birth": "1996-05-01",
                "donor_last_donation_date": "2024-12-15",
                "donor_permanent_address_city": "Kabul",
                "donor_local_address_city": "Herat",
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
        self.assertEqual(str(donor_profile.latitude), "34.555300")
        self.assertEqual(str(donor_profile.longitude), "69.207500")
        self.assertEqual(donor_profile.age, 28)
        self.assertEqual(donor_profile.date_of_birth.isoformat(), "1996-05-01")
        self.assertEqual(donor_profile.last_donation_date.isoformat(), "2024-12-15")
        self.assertEqual(donor_profile.permanent_address_city, "Kabul")
        self.assertEqual(donor_profile.local_address_city, "Herat")

    def test_signup_rejects_invalid_donor_latitude(self):
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Bad",
                "last_name": "Lat",
                "username": "bad-lat-donor",
                "email": "bad-lat@example.com",
                "phone": "0700000099",
                "donor_blood_group": "A+",
                "donor_latitude": "91.000000",
                "donor_longitude": "69.207500",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "role": "donor",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("donor_latitude", response.data)

    def test_signup_rejects_non_numeric_or_short_phone(self):
        for username, phone in (
            ("bad-phone-alpha", "07000A0001"),
            ("bad-phone-short", "070000001"),
        ):
            response = self.client.post(
                self.signup_url,
                {
                    "first_name": "Bad",
                    "last_name": "Phone",
                    "username": username,
                    "email": f"{username}@example.com",
                    "phone": phone,
                    "donor_blood_group": "A+",
                    "password": "StrongPass123!",
                    "confirm_password": "StrongPass123!",
                    "role": "donor",
                },
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("phone", response.data)

    def test_recipient_signup_creates_recipient_role(self):
        hospital = Hospital.objects.create(
            name="City Hospital",
            phone="0799999999",
            email="hospital@example.com",
            province="Kabul",
            city="Kabul",
        )
        response = self.client.post(
            self.signup_url,
            {
                "first_name": "Recipient",
                "last_name": "User",
                "username": "recipient-signup",
                "email": "recipient-signup@example.com",
                "phone": "0700000002",
                "recipient_required_blood_group": "B+",
                "recipient_hospital": hospital.id,
                "recipient_emergency_level": "urgent",
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
        self.assertEqual(recipient_profile.required_blood_group, "B+")
        self.assertEqual(recipient_profile.hospital, hospital)
        self.assertEqual(recipient_profile.emergency_level, "urgent")

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


class AuthMobileTokenFlowTests(APITestCase):
    mobile_refresh_url = "/api/accounts/token/mobile-refresh/"
    logout_url = "/api/accounts/auth/logout/"

    def setUp(self):
        self.user = User.objects.create_user(
            username="mobile-flow-user",
            password="StrongPass123!",
            role_name="donor",
            email="mobile-flow@example.com",
        )

    def test_mobile_refresh_rotates_tokens_from_json_body(self):
        refresh = RefreshToken.for_user(self.user)
        refresh_str = str(refresh)

        response = self.client.post(
            self.mobile_refresh_url,
            {"refresh": refresh_str},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotEqual(response.data["refresh"], refresh_str)

    def test_logout_accepts_refresh_token_in_json_body(self):
        refresh = RefreshToken.for_user(self.user)
        access = str(refresh.access_token)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.post(
            self.logout_url,
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("detail"), "Logged out")
