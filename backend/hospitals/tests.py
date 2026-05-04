from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User
from core.models import Permission
from recipients.models import Recipient

from .models import Hospital


class HospitalApiTests(APITestCase):
    base_url = "/api/hospitals/"

    @classmethod
    def setUpTestData(cls):
        actions = ["view", "add", "change", "delete"]
        cls.permissions = {}

        for action in actions:
            permission, _ = Permission.objects.get_or_create(
                module="hospitals",
                action=action,
                defaults={"description": f"Can {action} hospitals"},
            )
            cls.permissions[action] = permission

        for action in actions:
            RolePermission.objects.get_or_create(role_name="admin", permission=cls.permissions[action])
        RolePermission.objects.get_or_create(role_name="viewer", permission=cls.permissions["view"])

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="hospital_admin",
            password="StrongPass123!",
            role_name="admin",
        )
        self.viewer_user = User.objects.create_user(
            username="hospital_viewer",
            password="StrongPass123!",
            role_name="viewer",
        )
        self.client.force_authenticate(user=self.admin_user)

    def _payload(self, **kwargs):
        payload = {
            "name": "City Hospital",
            "phone": "0700100001",
            "email": "contact@cityhospital.com",
            "address": "Main Street",
            "province": "Kabul",
            "city": "Kabul",
            "latitude": "34.555300",
            "longitude": "69.207500",
        }
        payload.update(kwargs)
        return payload

    def test_create_list_update_delete_hospital(self):
        create_response = self.client.post(self.base_url, self._payload(), format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        hospital_id = create_response.data["id"]
        self.assertEqual(create_response.data["phone"], "0700100001")
        self.assertEqual(create_response.data["email"], "contact@cityhospital.com")
        self.assertEqual(create_response.data["province"], "Kabul")

        Hospital.objects.create(
            name="Herat Regional",
            phone="0700100002",
            province="Herat",
            city="Herat",
        )

        list_response = self.client.get(self.base_url, {"search": "City", "province": "Kabul"})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 1)

        update_response = self.client.patch(
            f"{self.base_url}{hospital_id}/",
            {"province": "Herat"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["province"], "Herat")
        self.assertEqual(update_response.data["city"], "Herat")

        delete_response = self.client.delete(f"{self.base_url}{hospital_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        hospital = Hospital.all_objects.get(pk=hospital_id)
        self.assertIsNotNone(hospital.deleted_at)

    def test_rejects_invalid_coordinates(self):
        response = self.client.post(
            self.base_url,
            self._payload(latitude="100", longitude="190"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", response.data)
        self.assertIn("longitude", response.data)

    def test_viewer_cannot_mutate(self):
        self.client.force_authenticate(user=self.viewer_user)

        create_response = self.client.post(self.base_url, self._payload(phone="0700222222"), format="json")
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_delete_hospital_with_recipients(self):
        hospital = Hospital.objects.create(
            name="Linked Hospital",
            phone="0700999999",
            province="Kabul",
            city="Kabul",
        )
        Recipient.objects.create(
            full_name="Linked Recipient",
            phone="0710000001",
            required_blood_group="A+",
            hospital=hospital,
        )

        delete_response = self.client.delete(f"{self.base_url}{hospital.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_400_BAD_REQUEST)
