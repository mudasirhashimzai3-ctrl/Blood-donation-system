from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from reports.serializers import ReportFiltersSerializer
from reports.services import (
    build_donation_analytics,
    build_emergency_analysis,
    build_geographic_distance,
    build_hospital_performance,
    build_request_analytics,
    build_system_performance,
)
from reports.services.cache import get_cached_or_build


REPORT_BUILDERS = {
    "request-analytics": build_request_analytics,
    "donation-analytics": build_donation_analytics,
    "hospital-performance": build_hospital_performance,
    "emergency-analysis": build_emergency_analysis,
    "geographic-distance": build_geographic_distance,
    "system-performance": build_system_performance,
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



