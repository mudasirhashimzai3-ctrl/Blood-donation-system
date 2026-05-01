from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from hospitals.models import Hospital

from .models import Recipient


class RecipientApiTests(APITestCase):
    base_url = "/api/recipients/"

    @classmethod
    def setUpTestData(cls):
        actions = ["view", "add", "change", "delete"]
        cls.permissions = {}

        for action in actions:
            permission, _ = Permission.objects.get_or_create(
                module="recipients",
                action=action,
                defaults={"description": f"Can {action} recipients"},
            )
            cls.permissions[action] = permission

        RolePermission.objects.get_or_create(role_name="admin", permission=cls.permissions["view"])
        RolePermission.objects.get_or_create(role_name="admin", permission=cls.permissions["change"])
        RolePermission.objects.get_or_create(role_name="viewer", permission=cls.permissions["view"])

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="recipient_admin",
            password="StrongPass123!",
            role_name="admin",
        )
        self.viewer_user = User.objects.create_user(
            username="recipient_viewer",
            password="StrongPass123!",
            role_name="viewer",
        )
        self.client.force_authenticate(user=self.admin_user)

    def _create_hospital(self, **kwargs):
        defaults = {
            "name": "City Hospital",
            "phone": "0700100001",
            "email": None,
            "address": "Main Street",
            "city": "Kabul",
            "latitude": "34.555300",
            "longitude": "69.207500",
            "is_active": True,
        }
        defaults.update(kwargs)
        return Hospital.objects.create(**defaults)

    def test_create_recipient_endpoint_is_disabled(self):
        hospital = self._create_hospital()
        payload = {
            "full_name": "Ahmad Khan",
            "phone": "0700000011",
            "required_blood_group": "O+",
            "hospital": hospital.id,
        }
        response = self.client.post(self.base_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_list_supports_search_filters_ordering_and_pagination(self):
        kabul_hospital = self._create_hospital(name="Kabul Hospital", city="Kabul")
        herat_hospital = self._create_hospital(name="Herat Hospital", city="Herat", phone="0700100010")

        Recipient.objects.create(
            full_name="Ali Search",
            phone="0700000051",
            required_blood_group="O-",
            hospital=kabul_hospital,
            emergency_level="critical",
            status="blocked",
        )
        Recipient.objects.create(
            full_name="Bahar Filter",
            phone="0700000052",
            required_blood_group="A+",
            hospital=herat_hospital,
            emergency_level="urgent",
            status="active",
        )

        response = self.client.get(
            self.base_url,
            {
                "search": "Ali",
                "required_blood_group": "O-",
                "emergency_level": "critical",
                "city": "Kabul",
                "status": "blocked",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["full_name"], "Ali Search")

        page_response = self.client.get(self.base_url, {"page_size": 1, "ordering": "full_name"})
        self.assertEqual(page_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(page_response.data["results"]), 1)

    def test_retrieve_detail_returns_hospital_flattened_fields(self):
        hospital = self._create_hospital()
        recipient = Recipient.objects.create(
            full_name="Detail Recipient",
            phone="0700000061",
            email="detail@recipient.com",
            required_blood_group="B-",
            hospital=hospital,
            emergency_level="urgent",
            status="active",
        )
        response = self.client.get(f"{self.base_url}{recipient.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["hospital_name"], "City Hospital")
        self.assertEqual(response.data["hospital_phone"], "0700100001")
        self.assertEqual(response.data["city"], "Kabul")
        self.assertIn("latitude", response.data)
        self.assertIn("longitude", response.data)

    def test_retrieve_allows_recipient_without_hospital(self):
        recipient = Recipient.objects.create(
            full_name="No Hospital Recipient",
            phone="0700000062",
            email="nohospital@recipient.com",
            required_blood_group="AB-",
            hospital=None,
            emergency_level="normal",
            status="active",
        )
        response = self.client.get(f"{self.base_url}{recipient.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["hospital_name"])
        self.assertIsNone(response.data["hospital_is_active"])

    def test_block_and_unblock_actions_change_status(self):
        hospital = self._create_hospital()
        recipient = Recipient.objects.create(
            full_name="Action Recipient",
            phone="0700000071",
            required_blood_group="A-",
            hospital=hospital,
            emergency_level="normal",
            status="active",
        )

        block_response = self.client.patch(f"{self.base_url}{recipient.id}/block/", {}, format="json")
        self.assertEqual(block_response.status_code, status.HTTP_200_OK)
        self.assertEqual(block_response.data["status"], "blocked")

        unblock_response = self.client.patch(f"{self.base_url}{recipient.id}/unblock/", {}, format="json")
        self.assertEqual(unblock_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unblock_response.data["status"], "active")

    def test_delete_recipient_endpoint_is_disabled(self):
        hospital = self._create_hospital()
        recipient = Recipient.objects.create(
            full_name="Delete Recipient",
            phone="0700000081",
            required_blood_group="AB+",
            hospital=hospital,
            emergency_level="normal",
            status="active",
        )
        delete_response = self.client.delete(f"{self.base_url}{recipient.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_viewer_cannot_block(self):
        hospital = self._create_hospital()
        recipient = Recipient.objects.create(
            full_name="Viewer Check",
            phone="0700000091",
            required_blood_group="O+",
            hospital=hospital,
            emergency_level="urgent",
            status="active",
        )
        self.client.force_authenticate(user=self.viewer_user)

        block_response = self.client.patch(f"{self.base_url}{recipient.id}/block/", {}, format="json")
        self.assertEqual(block_response.status_code, status.HTTP_403_FORBIDDEN)
