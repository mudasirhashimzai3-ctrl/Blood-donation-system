import shutil
import tempfile
from datetime import timedelta
from decimal import Decimal

from django.test import override_settings
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from core.services.settings_service import update_section
from donations.models import Donation
from blood_requests.models import BloodRequest
from hospitals.models import Hospital
from recipients.models import Recipient
from .models import Donor
from .tasks import refresh_donor_availability_task


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

    def test_create_donor_defaults_to_active(self):
        payload = {
            "first_name": "Ali",
            "last_name": "Karimi",
            "phone": "0700000001",
            "blood_group": "O+",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Donor.objects.count(), 1)
        self.assertEqual(response.data["status"], "active")

    def test_create_donor_ignores_status_payload(self):
        payload = {
            "first_name": "Status",
            "last_name": "Ignored",
            "phone": "0700000041",
            "blood_group": "A+",
            "status": "pending",
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "active")

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

    def test_list_supports_blood_group_ordering_and_pagination(self):
        Donor.objects.create(
            first_name="Zia",
            last_name="Last",
            phone="0700000011",
            blood_group="A+",
            status="active",
            permanent_address_city="Zia City",
        )
        Donor.objects.create(
            first_name="Aman",
            last_name="First",
            phone="0700000012",
            blood_group="O-",
            status="active",
        )

        response = self.client.get(
            self.base_url,
            {"blood_group": "O-", "ordering": "last_name"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["first_name"], "Aman")

        removed_filters_response = self.client.get(self.base_url, {"search": "Zia Street", "status": "active"})
        self.assertEqual(removed_filters_response.status_code, status.HTTP_200_OK)
        self.assertEqual(removed_filters_response.data["count"], 2)

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
            age=28,
            permanent_address_city="Permanent City",
            local_address_city="Local City",
        )
        response = self.client.get(f"{self.base_url}{donor.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "detail@example.com")
        self.assertEqual(response.data["age"], 28)
        self.assertEqual(response.data["permanent_address_city"], "Permanent City")
        self.assertEqual(response.data["local_address_city"], "Local City")
        self.assertIn("profile_picture_url", response.data)

    def test_update_forces_status_to_active(self):
        donor = Donor.objects.create(
            first_name="Pending",
            last_name="Donor",
            phone="0700000014",
            blood_group="O+",
            status="pending",
        )
        response = self.client.patch(
            f"{self.base_url}{donor.id}/",
            {"last_name": "Updated", "status": "blocked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donor.refresh_from_db()
        self.assertEqual(donor.last_name, "Updated")
        self.assertEqual(donor.status, "active")

    def test_remove_profile_picture_clears_image(self):
        donor = Donor.objects.create(
            first_name="Photo",
            last_name="Remove",
            phone="0700000081",
            blood_group="A+",
            status="active",
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
            "date_of_birth": future_date.isoformat(),
            "last_donation_date": future_date.isoformat(),
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_of_birth", response.data)
        self.assertIn("last_donation_date", response.data)

    def test_me_patch_works_without_role_matrix_permissions(self):
        donor_user = User.objects.create_user(
            username="self_donor",
            password="StrongPass123!",
            role_name="donor",
            phone="0700001010",
        )
        Donor.objects.create(
            user=donor_user,
            first_name="Self",
            last_name="Donor",
            phone="0700001010",
            blood_group="A+",
            status="active",
        )

        # Intentionally no donor role rows in RolePermission.
        RolePermission.objects.filter(role_name="donor", permission__module="donors").delete()

        self.client.force_authenticate(user=donor_user)
        response = self.client.patch(
            f"{self.base_url}me/",
            {"last_name": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["last_name"], "Updated")

    def test_me_patch_rejects_invalid_phone(self):
        donor_user = User.objects.create_user(
            username="self_donor_bad_phone",
            password="StrongPass123!",
            role_name="donor",
            phone="0700001020",
        )
        Donor.objects.create(
            user=donor_user,
            first_name="Self",
            last_name="Donor",
            phone="0700001020",
            blood_group="A+",
            status="active",
        )

        self.client.force_authenticate(user=donor_user)
        response = self.client.patch(
            f"{self.base_url}me/",
            {"phone": "07000A1020"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_me_endpoint_rejects_non_donor_role(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"{self.base_url}me/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_donor_age_must_be_strictly_greater_than_18(self):
        underage_response = self.client.post(
            self.base_url,
            {
                "first_name": "Age",
                "last_name": "Boundary",
                "phone": "0700002018",
                "blood_group": "B+",
                "age": 18,
            },
            format="json",
        )
        self.assertEqual(underage_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("age", underage_response.data)

        valid_response = self.client.post(
            self.base_url,
            {
                "first_name": "Age",
                "last_name": "Valid",
                "phone": "0700002019",
                "blood_group": "B+",
                "age": 19,
            },
            format="json",
        )
        self.assertEqual(valid_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(valid_response.data["age"], 19)

        nullable_response = self.client.post(
            self.base_url,
            {
                "first_name": "Age",
                "last_name": "Nullable",
                "phone": "0700002020",
                "blood_group": "O+",
            },
            format="json",
        )
        self.assertEqual(nullable_response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(nullable_response.data["age"])

    def test_candidates_returns_compatible_donors_sorted_by_distance(self):
        hospital = Hospital.objects.create(
            name="Candidate Hospital",
            phone="0700300001",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        recipient = Recipient.objects.create(
            full_name="Candidate Recipient",
            phone="0700300002",
            required_blood_group="A+",
            hospital=hospital,
        )
        blood_request = BloodRequest.objects.create(
            recipient=recipient,
            hospital=hospital,
            blood_group="A+",
            units_needed=1,
            request_type="urgent",
            location_lat=Decimal("34.555300"),
            location_lon=Decimal("69.207500"),
            response_deadline=timezone.now() + timedelta(hours=2),
        )
        near_universal = Donor.objects.create(
            first_name="Near",
            last_name="Universal",
            phone="0700300011",
            blood_group="O-",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )
        far_exact = Donor.objects.create(
            first_name="Far",
            last_name="Exact",
            phone="0700300012",
            blood_group="A+",
            latitude=Decimal("34.600000"),
            longitude=Decimal("69.250000"),
        )
        Donor.objects.create(
            first_name="Wrong",
            last_name="Group",
            phone="0700300013",
            blood_group="B+",
            latitude=Decimal("34.555400"),
            longitude=Decimal("69.207600"),
        )

        response = self.client.get(
            f"{self.base_url}candidates/",
            {"blood_request_id": blood_request.id, "blood_group": "A+", "radius_km": 20},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data["results"]]
        self.assertEqual(ids, [near_universal.id, far_exact.id])
        self.assertEqual(response.data["results"][0]["match_type"], "compatible")
        self.assertEqual(response.data["results"][1]["match_type"], "exact")

    def test_candidates_show_only_active_eligible_donors_and_radius_filter(self):
        hospital = Hospital.objects.create(
            name="Eligibility Hospital",
            phone="0700400001",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        recipient = Recipient.objects.create(
            full_name="Eligibility Recipient",
            phone="0700400002",
            required_blood_group="O+",
            hospital=hospital,
        )
        blood_request = BloodRequest.objects.create(
            recipient=recipient,
            hospital=hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat=Decimal("34.555300"),
            location_lon=Decimal("69.207500"),
            response_deadline=timezone.now() + timedelta(hours=2),
        )
        recent = Donor.objects.create(
            first_name="Recent",
            last_name="Donor",
            phone="0700400011",
            blood_group="O+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
            last_donation_date=timezone.localdate() - timedelta(days=30),
        )
        eligible = Donor.objects.create(
            first_name="Eligible",
            last_name="Donor",
            phone="0700400012",
            blood_group="O+",
            latitude=Decimal("34.556000"),
            longitude=Decimal("69.208000"),
            last_donation_date=timezone.localdate() - timedelta(days=220),
        )
        Donor.objects.create(
            first_name="Far",
            last_name="Away",
            phone="0700400013",
            blood_group="O+",
            latitude=Decimal("40.000000"),
            longitude=Decimal("75.000000"),
        )

        response = self.client.get(
            f"{self.base_url}candidates/",
            {"blood_request_id": blood_request.id, "radius_km": 10},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data["results"]]
        self.assertEqual(ids, [eligible.id])
        by_id = {item["id"]: item for item in response.data["results"]}
        self.assertTrue(by_id[eligible.id]["is_eligible"])
        recent.refresh_from_db()
        self.assertEqual(recent.status, "inactive")

    def test_recipient_can_search_only_own_active_request_candidates(self):
        recipient_user = User.objects.create_user(
            username="recipient-candidate-user",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700500001",
        )
        other_user = User.objects.create_user(
            username="recipient-other-candidate-user",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700500002",
        )
        hospital = Hospital.objects.create(
            name="Recipient Candidate Hospital",
            phone="0700500003",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        recipient = Recipient.objects.create(
            user=recipient_user,
            full_name="Candidate Owner",
            phone="0700500001",
            required_blood_group="O+",
            hospital=hospital,
        )
        other_recipient = Recipient.objects.create(
            user=other_user,
            full_name="Candidate Other",
            phone="0700500002",
            required_blood_group="O+",
            hospital=hospital,
        )
        own_request = BloodRequest.objects.create(
            recipient=recipient,
            hospital=hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat=Decimal("34.555300"),
            location_lon=Decimal("69.207500"),
            response_deadline=timezone.now() + timedelta(hours=2),
        )
        other_request = BloodRequest.objects.create(
            recipient=other_recipient,
            hospital=hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat=Decimal("34.555300"),
            location_lon=Decimal("69.207500"),
            response_deadline=timezone.now() + timedelta(hours=2),
        )
        donor = Donor.objects.create(
            first_name="Recipient",
            last_name="Candidate",
            phone="0700500011",
            blood_group="O+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )

        self.client.force_authenticate(user=recipient_user)
        own_response = self.client.get(
            f"{self.base_url}candidates/",
            {"blood_request_id": own_request.id, "radius_km": 10},
        )
        other_response = self.client.get(
            f"{self.base_url}candidates/",
            {"blood_request_id": other_request.id, "radius_km": 10},
        )

        self.assertEqual(own_response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in own_response.data["results"]], [donor.id])
        self.assertEqual(other_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_candidates_reject_disallowed_roles(self):
        self.client.force_authenticate(user=self.viewer_user)
        response = self.client.get(f"{self.base_url}candidates/", {"blood_request_id": 1})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mobile_dashboard_returns_actionable_donation_requests(self):
        update_section(
            "auto_matching",
            {"max_distance_km": 10, "max_candidates_to_notify": 50},
            user=self.admin_user,
        )
        donor_user = User.objects.create_user(
            username="mobile-dashboard-donor",
            password="StrongPass123!",
            role_name="donor",
            phone="0700650001",
        )
        donor = Donor.objects.create(
            user=donor_user,
            first_name="Mobile",
            last_name="Donor",
            phone="0700650001",
            blood_group="O+",
            status="active",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
            last_donation_date=timezone.localdate() - timedelta(days=220),
        )
        incompatible_user = User.objects.create_user(
            username="mobile-dashboard-incompatible",
            password="StrongPass123!",
            role_name="donor",
            phone="0700650002",
        )
        incompatible_donor = Donor.objects.create(
            user=incompatible_user,
            first_name="Wrong",
            last_name="Group",
            phone="0700650002",
            blood_group="B+",
            status="active",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
            last_donation_date=timezone.localdate() - timedelta(days=220),
        )
        hospital = Hospital.objects.create(
            name="Dashboard Hospital",
            phone="0700650003",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        recipient = Recipient.objects.create(
            full_name="Dashboard Recipient",
            phone="0700650004",
            required_blood_group="O+",
            hospital=hospital,
        )
        blood_request = BloodRequest.objects.create(
            recipient=recipient,
            hospital=hospital,
            blood_group="O+",
            units_needed=1,
            request_type="urgent",
            location_lat=Decimal("34.555300"),
            location_lon=Decimal("69.207500"),
            response_deadline=timezone.now() + timedelta(hours=2),
            status="pending",
        )
        donation = Donation.objects.create(
            request=blood_request,
            donor=donor,
            status="pending",
            distance_km=Decimal("0.03"),
            estimated_arrival_time=5,
            notified_at=timezone.now(),
        )
        Donation.objects.create(
            request=blood_request,
            donor=incompatible_donor,
            status="pending",
            distance_km=Decimal("0.03"),
            estimated_arrival_time=5,
            notified_at=timezone.now(),
        )

        self.client.force_authenticate(user=donor_user)
        response = self.client.get(f"{self.base_url}mobile-dashboard/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("nearby_requests", response.data)
        rows = response.data["donation_requests"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["id"], donation.id)
        self.assertEqual(rows[0]["request"], blood_request.id)
        self.assertEqual(rows[0]["hospital_name"], hospital.name)
        self.assertEqual(rows[0]["request_blood_group"], "O+")
        self.assertEqual(rows[0]["request_type"], "urgent")

    def test_recipient_can_fetch_available_donors_from_hospital_location(self):
        recipient_user = User.objects.create_user(
            username="available-recipient",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700700001",
        )
        hospital = Hospital.objects.create(
            name="Available Hospital",
            phone="0700700002",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        Recipient.objects.create(
            user=recipient_user,
            full_name="Available Recipient",
            phone="0700700001",
            required_blood_group="A+",
            hospital=hospital,
        )
        exact = Donor.objects.create(
            first_name="Exact",
            last_name="Match",
            phone="0700700011",
            blood_group="A+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )
        compatible = Donor.objects.create(
            first_name="Compatible",
            last_name="Match",
            phone="0700700012",
            blood_group="O-",
            latitude=Decimal("34.556000"),
            longitude=Decimal("69.208000"),
        )
        Donor.objects.create(
            first_name="Wrong",
            last_name="Group",
            phone="0700700013",
            blood_group="B+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )
        recent = Donor.objects.create(
            first_name="Recent",
            last_name="Donation",
            phone="0700700014",
            blood_group="A+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
            last_donation_date=timezone.localdate() - timedelta(days=30),
        )

        self.client.force_authenticate(user=recipient_user)
        response = self.client.get(f"{self.base_url}available/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rows = response.data["results"]
        ids = [item["id"] for item in rows]
        self.assertEqual(ids, [exact.id, compatible.id])
        by_id = {item["id"]: item for item in rows}
        self.assertEqual(by_id[exact.id]["full_name"], "Exact Match")
        self.assertEqual(by_id[exact.id]["blood_group"], "A+")
        self.assertEqual(by_id[exact.id]["match_status"], "exact")
        self.assertEqual(by_id[exact.id]["eligibility_status"], "eligible")
        self.assertTrue(by_id[exact.id]["is_eligible"])
        self.assertEqual(by_id[exact.id]["phone"], "0700700011")
        self.assertEqual(by_id[compatible.id]["match_status"], "compatible")
        recent.refresh_from_db()
        self.assertEqual(recent.status, "inactive")

    def test_available_donors_supports_blood_group_and_radius_filters(self):
        recipient_user = User.objects.create_user(
            username="available-filter-recipient",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700710001",
        )
        hospital = Hospital.objects.create(
            name="Available Filter Hospital",
            phone="0700710002",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        Recipient.objects.create(
            user=recipient_user,
            full_name="Available Filter Recipient",
            phone="0700710001",
            required_blood_group="O+",
            hospital=hospital,
        )
        nearby_a_positive = Donor.objects.create(
            first_name="Nearby",
            last_name="Apositive",
            phone="0700710011",
            blood_group="A+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )
        Donor.objects.create(
            first_name="Far",
            last_name="Apositive",
            phone="0700710012",
            blood_group="A+",
            latitude=Decimal("34.700000"),
            longitude=Decimal("69.350000"),
        )
        compatible_o_positive = Donor.objects.create(
            first_name="Default",
            last_name="Opositive",
            phone="0700710013",
            blood_group="O+",
            latitude=Decimal("34.555500"),
            longitude=Decimal("69.207700"),
        )

        self.client.force_authenticate(user=recipient_user)
        response = self.client.get(
            f"{self.base_url}available/",
            {"blood_group": "A+", "radius_km": 10},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["id"] for item in response.data["results"]],
            [nearby_a_positive.id, compatible_o_positive.id],
        )
        by_id = {item["id"]: item for item in response.data["results"]}
        self.assertEqual(by_id[nearby_a_positive.id]["match_status"], "exact")
        self.assertEqual(by_id[compatible_o_positive.id]["match_status"], "compatible")

    def test_available_donors_rejects_non_recipient_roles(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"{self.base_url}available/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_available_donors_requires_blood_group_and_hospital_coordinates(self):
        recipient_user = User.objects.create_user(
            username="available-invalid-recipient",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700720001",
        )
        hospital = Hospital.objects.create(
            name="Available Invalid Hospital",
            phone="0700720002",
            province="Kabul",
            city="Kabul",
        )
        Recipient.objects.create(
            user=recipient_user,
            full_name="Available Invalid Recipient",
            phone="0700720001",
            hospital=hospital,
        )

        self.client.force_authenticate(user=recipient_user)
        missing_blood_group = self.client.get(f"{self.base_url}available/")
        self.assertEqual(missing_blood_group.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("blood_group", missing_blood_group.data)

        missing_coordinates = self.client.get(
            f"{self.base_url}available/",
            {"blood_group": "O+"},
        )
        self.assertEqual(missing_coordinates.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("hospital", missing_coordinates.data)

    def test_available_donors_rejects_invalid_filters(self):
        recipient_user = User.objects.create_user(
            username="available-bad-filter-recipient",
            password="StrongPass123!",
            role_name="recipient",
            phone="0700730001",
        )
        hospital = Hospital.objects.create(
            name="Available Bad Filter Hospital",
            phone="0700730002",
            province="Kabul",
            city="Kabul",
            latitude=Decimal("34.555300"),
            longitude=Decimal("69.207500"),
        )
        Recipient.objects.create(
            user=recipient_user,
            full_name="Available Bad Filter Recipient",
            phone="0700730001",
            required_blood_group="O+",
            hospital=hospital,
        )

        self.client.force_authenticate(user=recipient_user)
        invalid_blood_group = self.client.get(
            f"{self.base_url}available/",
            {"blood_group": "Z+"},
        )
        self.assertEqual(invalid_blood_group.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("blood_group", invalid_blood_group.data)

        invalid_radius = self.client.get(
            f"{self.base_url}available/",
            {"radius_km": 15},
        )
        self.assertEqual(invalid_radius.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("radius_km", invalid_radius.data)

    def test_daily_refresh_reactivates_eligible_inactive_donors(self):
        donor = Donor.objects.create(
            first_name="Ready",
            last_name="Again",
            phone="0700600011",
            blood_group="A+",
            status="inactive",
            last_donation_date=timezone.localdate() - timedelta(days=220),
        )

        result = refresh_donor_availability_task()

        donor.refresh_from_db()
        self.assertEqual(result["updated"], 1)
        self.assertEqual(donor.status, "active")
