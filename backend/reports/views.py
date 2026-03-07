from django.http import FileResponse
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin, _user_has_permission
from reports.models import ReportExportJob
from reports.serializers import (
    ReportExportCreateSerializer,
    ReportExportJobSerializer,
    ReportFiltersSerializer,
)
from reports.services import (
    build_donation_analytics,
    build_dashboard_overview,
    build_emergency_analysis,
    build_geographic_distance,
    build_hospital_performance,
    build_request_analytics,
    build_system_performance,
)
from reports.services.cache import get_cached_or_build
from reports.tasks import generate_report_export


REPORT_BUILDERS = {
    "request-analytics": build_request_analytics,
    "donation-analytics": build_donation_analytics,
    "hospital-performance": build_hospital_performance,
    "emergency-analysis": build_emergency_analysis,
    "geographic-distance": build_geographic_distance,
    "system-performance": build_system_performance,
    "dashboard-overview": build_dashboard_overview,
}


class BaseReportAPIView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = "reports"

    endpoint_name = ""

    def _parse_filters(self, request):
        serializer = ReportFiltersSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def _is_cache_bypass(self, request):
        cache_flag = str(request.query_params.get("cache", "true")).lower()
        is_admin = request.user.is_superuser or request.user.role_name == "admin"
        return cache_flag == "false" and is_admin

    def _build_payload(self, request):
        filters = self._parse_filters(request)
        builder = REPORT_BUILDERS[self.endpoint_name]
        payload, from_cache = get_cached_or_build(
            self.endpoint_name,
            filters,
            bypass_cache=self._is_cache_bypass(request),
            builder=lambda: builder(filters),
        )
        payload["cache"] = {
            "from_cache": from_cache,
            "ttl_seconds": 300,
        }
        return payload, filters


class RequestAnalyticsView(BaseReportAPIView):
    endpoint_name = "request-analytics"

    def get(self, request):
        payload, _ = self._build_payload(request)
        return Response(payload, status=status.HTTP_200_OK)


class DonationAnalyticsView(BaseReportAPIView):
    endpoint_name = "donation-analytics"

    def get(self, request):
        payload, _ = self._build_payload(request)
        return Response(payload, status=status.HTTP_200_OK)


class HospitalPerformanceView(BaseReportAPIView):
    endpoint_name = "hospital-performance"

    def get(self, request):
        payload, filters = self._build_payload(request)
        rows = payload.get("rows", [])

        search = (filters.get("search") or "").strip().lower()
        if search:
            rows = [
                row
                for row in rows
                if search in row["hospital_name"].lower() or search in row.get("city", "").lower()
            ]

        ordering = filters.get("ordering") or "-request_volume"
        reverse = ordering.startswith("-")
        key = ordering[1:] if reverse else ordering
        if rows and key in rows[0]:
            rows = sorted(rows, key=lambda item: (item.get(key) is None, item.get(key)), reverse=reverse)

        paginator = StandardResultsSetPagination()
        paged = paginator.paginate_queryset(rows, request, view=self)
        payload["rows"] = paged
        payload["pagination"] = {
            "count": len(rows),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        }
        return Response(payload, status=status.HTTP_200_OK)


class EmergencyAnalysisView(BaseReportAPIView):
    endpoint_name = "emergency-analysis"

    def get(self, request):
        payload, _ = self._build_payload(request)
        return Response(payload, status=status.HTTP_200_OK)


class GeographicDistanceView(BaseReportAPIView):
    endpoint_name = "geographic-distance"

    def get(self, request):
        payload, filters = self._build_payload(request)
        rows = payload.get("farthest_cases", [])

        search = (filters.get("search") or "").strip().lower()
        if search:
            rows = [
                row
                for row in rows
                if search in row["hospital_name"].lower()
                or search in row["city"].lower()
                or search in row["donor_name"].lower()
            ]

        ordering = filters.get("ordering") or "-distance_km"
        reverse = ordering.startswith("-")
        key = ordering[1:] if reverse else ordering
        if rows and key in rows[0]:
            rows = sorted(rows, key=lambda item: (item.get(key) is None, item.get(key)), reverse=reverse)

        paginator = StandardResultsSetPagination()
        paged = paginator.paginate_queryset(rows, request, view=self)
        payload["farthest_cases"] = paged
        payload["farthest_cases_pagination"] = {
            "count": len(rows),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        }
        return Response(payload, status=status.HTTP_200_OK)


class SystemPerformanceView(BaseReportAPIView):
    endpoint_name = "system-performance"

    def get(self, request):
        payload, filters = self._build_payload(request)
        rows = payload.get("failed_events", [])

        search = (filters.get("search") or "").strip().lower()
        if search:
            rows = [row for row in rows if search in row["event_key"].lower()]

        ordering = filters.get("ordering") or "-count"
        reverse = ordering.startswith("-")
        key = ordering[1:] if reverse else ordering
        if rows and key in rows[0]:
            rows = sorted(rows, key=lambda item: (item.get(key) is None, item.get(key)), reverse=reverse)

        paginator = StandardResultsSetPagination()
        paged = paginator.paginate_queryset(rows, request, view=self)
        payload["failed_events"] = paged
        payload["failed_events_pagination"] = {
            "count": len(rows),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        }
        return Response(payload, status=status.HTTP_200_OK)


class DashboardOverviewView(BaseReportAPIView):
    endpoint_name = "dashboard-overview"

    def _can_view_module(self, request, module_name: str) -> bool:
        user = request.user
        if user.is_superuser or user.role_name == "admin":
            return True
        return _user_has_permission(user, module_name, "view")

    def get(self, request):
        payload, _ = self._build_payload(request)

        access = {
            "donors": self._can_view_module(request, "donors"),
            "recipients": self._can_view_module(request, "recipients"),
            "blood_requests": self._can_view_module(request, "blood_requests"),
            "donations": self._can_view_module(request, "donations"),
        }

        kpis = payload.get("kpis", {})
        charts = payload.get("charts", {})
        statistics = payload.get("statistics", {})

        if not access["donors"]:
            kpis["total_donors"] = None
        if not access["recipients"]:
            kpis["total_recipients"] = None
        if not access["blood_requests"]:
            kpis["active_requests"] = None
            charts["requests_status_distribution"] = None
            statistics["request_completion_rate"] = None
        if not access["donations"]:
            kpis["completed_donations"] = None
            charts["donations_trend"] = None
            statistics["donation_completion_rate"] = None
            statistics["avg_donation_response_time_minutes"] = None
        if not (access["donors"] and access["blood_requests"]):
            charts["blood_group_supply_vs_demand"] = None

        payload["access"] = access
        payload["kpis"] = kpis
        payload["charts"] = charts
        payload["statistics"] = statistics
        return Response(payload, status=status.HTTP_200_OK)


class ReportExportJobViewSet(
    PermissionMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    permission_module = "reports"
    serializer_class = ReportExportJobSerializer

    def get_queryset(self):
        return ReportExportJob.objects.filter(owner=self.request.user).order_by("-created_at")

    def _ensure_admin(self):
        user = self.request.user
        if not (user.is_superuser or user.role_name == "admin"):
            raise PermissionDenied("Only admins can access report exports.")

    def list(self, request, *args, **kwargs):
        self._ensure_admin()
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        self._ensure_admin()
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        self._ensure_admin()
        serializer = ReportExportCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        job = serializer.save()

        if hasattr(generate_report_export, "delay"):
            generate_report_export.delay(job.id)
        else:
            generate_report_export(job.id)

        output = ReportExportJobSerializer(job, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        self._ensure_admin()
        job = self.get_object()

        if job.status != "completed" or not job.artifact:
            raise ValidationError({"detail": "Export is not ready."})

        if job.expires_at and job.expires_at <= timezone.now():
            raise ValidationError({"detail": "Export file has expired."})

        return FileResponse(
            job.artifact.open("rb"),
            as_attachment=True,
            filename=job.artifact.name.split("/")[-1],
        )
