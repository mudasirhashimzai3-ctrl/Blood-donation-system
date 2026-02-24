import shutil
import tempfile
from datetime import timedelta

from django.test import override_settings
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from .models import Donor


def tiny_gif_file(name="avatar.gif"):
    gif_bytes = (
        b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
        b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x00\x00\x00\x00\x00"
        b"\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b"
    )
    return SimpleUploadedFile(name, gif_bytes, content_type="image/gif")


class DonorApiTests(APITestCase):
    base_url = "/api/donors/"
    media_dir = None

    @classmethod
    def setUpTestData(cls):
        actions = ["view", "add", "change", "delete"]
        cls.permissions = {}

        for action in actions:
            permission, _ = Permission.objects.get_or_create(
                module="donors",
                action=action,
                defaults={"description": f"Can {action} donors"},
            )
            cls.permissions[action] = permission

        for action in actions:
            RolePermission.objects.get_or_create(role_name="admin", permission=cls.permissions[action])
        for action in ["view"]:
            RolePermission.objects.get_or_create(role_name="viewer", permission=cls.permissions[action])

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
        self.admin_user = User.objects.create_user(
            username="admin_test",
            password="StrongPass123!",
            role_name="admin",
        )
        self.viewer_user = User.objects.create_user(
            username="viewer_test",
            password="StrongPass123!",
            role_name="viewer",
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_create_donor_defaults_to_pending(self):
        payload = {
            "first_name": "Ali",
            "last_name": "Karimi",
            "phone": "0700000001",
            "blood_group": "O+",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Donor.objects.count(), 1)
        self.assertEqual(response.data["status"], "pending")

    def test_create_donor_accepts_valid_multipart_image(self):
        payload = {
            "first_name": "Image",
            "last_name": "Donor",
            "phone": "0700000091",
            "blood_group": "A+",
            "profile_picture": tiny_gif_file(),
        }
        response = self.client.post(self.base_url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("profile_picture_url", response.data)
        self.assertTrue(response.data["profile_picture_url"])

    def test_create_rejects_invalid_or_oversized_image(self):
        bad_type = SimpleUploadedFile("file.txt", b"abc", content_type="text/plain")
        payload = {
            "first_name": "Invalid",
            "last_name": "Image",
            "phone": "0700000092",
            "blood_group": "B+",
            "profile_picture": bad_type,
        }
        response = self.client.post(self.base_url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("profile_picture", response.data)

        too_large = SimpleUploadedFile(
            "large.jpg",
            b"a" * (5 * 1024 * 1024 + 1),
            content_type="image/jpeg",
        )
        payload["phone"] = "0700000093"
        payload["profile_picture"] = too_large
        response = self.client.post(self.base_url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("profile_picture", response.data)

    def test_create_donor_duplicate_phone_fails(self):
        Donor.objects.create(
            first_name="A",
            last_name="B",
            phone="0700000002",
            blood_group="A+",
            status="active",
        )
        payload = {
            "first_name": "C",
            "last_name": "D",
            "phone": "0700000002",
            "blood_group": "B+",
            "status": "active",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_create_donor_duplicate_email_fails_case_insensitive(self):
        Donor.objects.create(
            first_name="A",
            last_name="B",
            phone="0700000003",
            email="donor@example.com",
            blood_group="AB+",
            status="active",
        )
        payload = {
            "first_name": "C",
            "last_name": "D",
            "phone": "0700000004",
            "email": "DONOR@example.com",
            "blood_group": "AB-",
            "status": "active",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_list_supports_search_filters_ordering_and_pagination(self):
        Donor.objects.create(
            first_name="Zia",
            last_name="Last",
            phone="0700000011",
            blood_group="A+",
            status="pending",
            emergency_contact_name="Brother",
            emergency_contact_phone="0700900001",
        )
        Donor.objects.create(
            first_name="Aman",
            last_name="First",
            phone="0700000012",
            blood_group="O-",
            status="blocked",
        )

        response = self.client.get(
            self.base_url,
            {"search": "Aman", "status": "blocked", "blood_group": "O-", "ordering": "last_name"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["first_name"], "Aman")

        pending_response = self.client.get(self.base_url, {"status": "pending"})
        self.assertEqual(pending_response.status_code, status.HTTP_200_OK)
        self.assertEqual(pending_response.data["count"], 1)

        emergency_search = self.client.get(self.base_url, {"search": "0700900001"})
        self.assertEqual(emergency_search.status_code, status.HTTP_200_OK)
        self.assertEqual(emergency_search.data["count"], 1)

        page_response = self.client.get(self.base_url, {"page_size": 1})
        self.assertEqual(page_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(page_response.data["results"]), 1)

    def test_retrieve_detail_returns_full_payload(self):
        donor = Donor.objects.create(
            first_name="Detail",
            last_name="Case",
            phone="0700000013",
            email="detail@example.com",
            blood_group="B-",
            status="active",
            address="Address",
            emergency_contact_name="Contact Name",
            emergency_contact_phone="0711111111",
            notes="Note",
        )
        response = self.client.get(f"{self.base_url}{donor.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "detail@example.com")
        self.assertEqual(response.data["address"], "Address")
        self.assertEqual(response.data["emergency_contact_name"], "Contact Name")
        self.assertEqual(response.data["emergency_contact_phone"], "0711111111")
        self.assertIn("profile_picture_url", response.data)

    def test_update_pending_donor_is_allowed(self):
        donor = Donor.objects.create(
            first_name="Pending",
            last_name="Donor",
            phone="0700000014",
            blood_group="O+",
            status="pending",
        )
        response = self.client.patch(
            f"{self.base_url}{donor.id}/",
            {"last_name": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donor.refresh_from_db()
        self.assertEqual(donor.last_name, "Updated")

    def test_remove_profile_picture_clears_image(self):
        donor = Donor.objects.create(
            first_name="Photo",
            last_name="Remove",
            phone="0700000081",
            blood_group="A+",
            status="pending",
            profile_picture=tiny_gif_file("remove.gif"),
        )
        self.assertTrue(donor.profile_picture)

        response = self.client.patch(
            f"{self.base_url}{donor.id}/",
            {"remove_profile_picture": "true"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donor.refresh_from_db()
        self.assertFalse(bool(donor.profile_picture))

    def test_delete_soft_deletes_and_hides_from_default_list(self):
        donor = Donor.objects.create(
            first_name="Soft",
            last_name="Delete",
            phone="0700000015",
            blood_group="A-",
            status="active",
        )
        delete_response = self.client.delete(f"{self.base_url}{donor.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        donor.refresh_from_db()
        self.assertIsNotNone(donor.deleted_at)

        list_response = self.client.get(self.base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 0)

    def test_permission_denied_for_disallowed_action(self):
        self.client.force_authenticate(user=self.viewer_user)
        payload = {
            "first_name": "View",
            "last_name": "Only",
            "phone": "0700000016",
            "blood_group": "A+",
            "status": "pending",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_validation_rejects_future_dates(self):
        future_date = timezone.localdate() + timedelta(days=1)
        payload = {
            "first_name": "Future",
            "last_name": "Date",
            "phone": "0700000017",
            "blood_group": "B+",
            "status": "active",
            "date_of_birth": future_date.isoformat(),
            "last_donation_date": future_date.isoformat(),
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_of_birth", response.data)
        self.assertIn("last_donation_date", response.data)
