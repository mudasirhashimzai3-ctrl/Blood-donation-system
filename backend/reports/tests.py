from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import RolePermission, User, UserPermission
from blood_requests.models import BloodRequest
from core.models import Permission
from donations.models import Donation
from donors.models import Donor
from hospitals.models import Hospital
from notifications.models import Notification
from recipients.models import Recipient
from reports.models import ReportExportJob
from reports.tasks import generate_report_export


class ReportsApiTests(APITestCase):
    base_url = "/api/reports/"

    @classmethod
    def setUpTestData(cls):
        permissions = {}
        for action in ["view", "add", "change", "delete"]:
            permission, _ = Permission.objects.get_or_create(
                module="reports",
                action=action,
                defaults={"description": f"Can {action} reports"},
            )
            permissions[action] = permission

        for module_name in ["donors", "recipients", "blood_requests", "donations"]:
            permission, _ = Permission.objects.get_or_create(
                module=module_name,
                action="view",
                defaults={"description": f"Can view {module_name}"},
            )
            RolePermission.objects.get_or_create(role_name="admin", permission=permission)
            RolePermission.objects.get_or_create(role_name="viewer", permission=permission)

        for action in ["view", "add"]:
            RolePermission.objects.get_or_create(role_name="admin", permission=permissions[action])
        RolePermission.objects.get_or_create(role_name="receptionist", permission=permissions["view"])
        RolePermission.objects.get_or_create(role_name="viewer", permission=permissions["view"])

    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username=f"reports-admin-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="admin",
        )
        self.viewer = User.objects.create_user(
            username=f"reports-viewer-{User.objects.count() + 1}",
            password="StrongPass123!",
            role_name="viewer",
        )

        self.hospital = Hospital.objects.create(
            name="Insight Hospital",
            city="Kabul",
            phone=f"0702{Hospital.objects.count() + 1000}",
            latitude="34.555300",
            longitude="69.207500",
            is_active=True,
        )
        self.recipient = Recipient.objects.create(
            full_name="Recipient Report",
            phone=f"0703{Recipient.objects.count() + 1000}",
            required_blood_group="A+",
            age=30,
            gender="male",
            emergency_level="critical",
            hospital=self.hospital,
            status="active",
        )
        self.request_obj = BloodRequest.objects.create(
            recipient=self.recipient,
            hospital=self.hospital,
            blood_group="A+",
            units_needed=2,
            request_type="critical",
            priority="critical",
            auto_match_enabled=True,
            location_lat="34.555300",
            location_lon="69.207500",
            response_deadline=timezone.now() + timedelta(hours=1),
            status="matched",
            is_emergency=True,
            matched_at=timezone.now() - timedelta(minutes=40),
            completed_at=timezone.now() - timedelta(minutes=10),
        )
        self.donor = Donor.objects.create(
            first_name="Donor",
            last_name="Report",
            phone=f"0704{Donor.objects.count() + 1000}",
            blood_group="A+",
            status="active",
            latitude=Decimal("34.556000"),
            longitude=Decimal("69.207700"),
        )
        self.donation = Donation.objects.create(
            request=self.request_obj,
            donor=self.donor,
            status="completed",
            response_time=12,
            distance_km=Decimal("1.80"),
            estimated_arrival_time=15,
            notified_at=timezone.now() - timedelta(minutes=60),
            responded_at=timezone.now() - timedelta(minutes=48),
            reminder_count=1,
            priority_score=Decimal("42.00"),
        )
        Notification.objects.create(
            user=self.admin,
            user_type="staff",
            request=self.request_obj,
            donation=self.donation,
            event_key="donation_status_updated",
            type="donation_update",
            title="Donation updated",
            message="Donation status changed",
            sent_via="in_app",
            status="delivered",
        )

    def test_viewer_can_read_analytics(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.get(f"{self.base_url}request-analytics/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("summary", response.data)

    def test_date_filter_validation(self):
        self.client.force_authenticate(user=self.viewer)
        date_from = (timezone.now() - timedelta(days=400)).isoformat()
        date_to = timezone.now().isoformat()
        response = self.client.get(
            f"{self.base_url}request-analytics/?date_from={date_from}&date_to={date_to}"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cache_reuse(self):
        self.client.force_authenticate(user=self.viewer)
        first = self.client.get(f"{self.base_url}donation-analytics/")
        second = self.client.get(f"{self.base_url}donation-analytics/")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertFalse(first.data["cache"]["from_cache"])
        self.assertTrue(second.data["cache"]["from_cache"])

    def test_admin_can_create_and_generate_export(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"{self.base_url}exports/",
            {
                "report_type": "donation_analytics",
                "format": "csv",
                "filters": {"group_by": "day"},
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job_id = response.data["id"]

        # Run task inline to assert completion behavior deterministically.
        generate_report_export(job_id)

        job = ReportExportJob.objects.get(id=job_id)
        self.assertEqual(job.status, "completed")
        self.assertTrue(bool(job.artifact))

        detail = self.client.get(f"{self.base_url}exports/{job_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_non_admin_cannot_export(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(
            f"{self.base_url}exports/",
            {
                "report_type": "request_analytics",
                "format": "pdf",
                "filters": {},
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_overview_accessible(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.get(f"{self.base_url}dashboard-overview/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("kpis", response.data)
        self.assertIn("charts", response.data)
        self.assertIn("statistics", response.data)
        self.assertIn("access", response.data)

    def test_dashboard_overview_date_validation(self):
        self.client.force_authenticate(user=self.viewer)
        date_from = (timezone.now() - timedelta(days=400)).isoformat()
        date_to = timezone.now().isoformat()
        response = self.client.get(
            f"{self.base_url}dashboard-overview/?date_from={date_from}&date_to={date_to}"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_overview_cache_reuse(self):
        self.client.force_authenticate(user=self.viewer)
        first = self.client.get(f"{self.base_url}dashboard-overview/")
        second = self.client.get(f"{self.base_url}dashboard-overview/")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertFalse(first.data["cache"]["from_cache"])
        self.assertTrue(second.data["cache"]["from_cache"])

    def test_dashboard_overview_kpi_values(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.get(f"{self.base_url}dashboard-overview/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["kpis"]["total_donors"]["value"], 1)
        self.assertEqual(response.data["kpis"]["total_recipients"]["value"], 1)
        self.assertEqual(response.data["kpis"]["active_requests"]["value"], 1)
        self.assertEqual(response.data["kpis"]["completed_donations"]["value"], 1)

    def test_dashboard_overview_module_access_masking(self):
        permission = Permission.objects.get(module="donors", action="view")
        UserPermission.objects.create(user=self.viewer, permission=permission, allow=False)

        self.client.force_authenticate(user=self.viewer)
        response = self.client.get(f"{self.base_url}dashboard-overview/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["access"]["donors"])
        self.assertIsNone(response.data["kpis"]["total_donors"])
        self.assertIsNone(response.data["charts"]["blood_group_supply_vs_demand"])
