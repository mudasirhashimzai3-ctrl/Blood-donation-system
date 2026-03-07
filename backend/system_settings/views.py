from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import CanAccessSettings, PermissionMixin
from system_settings.constants import (
    SECTION_AUTO_MATCHING,
    SECTION_BLOOD_REQUEST_RULES,
    SECTION_DONOR_ELIGIBILITY,
    SECTION_EMERGENCY_ALERTS,
    SECTION_GENERAL,
    SECTION_LOCALIZATION,
    SECTION_NOTIFICATIONS,
    SECTION_SECURITY,
    SECTION_USER_ROLES,
)
from system_settings.models import SystemSettingsAuditLog
from system_settings.serializers import (
    AutoMatchingSettingsSerializer,
    BloodRequestRulesSerializer,
    DonorEligibilityRulesSerializer,
    EmergencyAlertSettingsSerializer,
    GeneralSettingsSerializer,
    LocalizationSettingsSerializer,
    NotificationSettingsSerializer,
    ResetSectionSerializer,
    SecuritySettingsSerializer,
    SystemSettingsAuditLogSerializer,
    TestChannelSerializer,
    UserRoleSettingsSerializer,
)
from system_settings.services import get_section, mask_sensitive_values, reset_section, update_section


class SystemSettingsViewSet(PermissionMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated, CanAccessSettings]
    pagination_class = StandardResultsSetPagination

    section_serializers = {
        SECTION_GENERAL: GeneralSettingsSerializer,
        SECTION_USER_ROLES: UserRoleSettingsSerializer,
        SECTION_NOTIFICATIONS: NotificationSettingsSerializer,
        SECTION_EMERGENCY_ALERTS: EmergencyAlertSettingsSerializer,
        SECTION_BLOOD_REQUEST_RULES: BloodRequestRulesSerializer,
        SECTION_DONOR_ELIGIBILITY: DonorEligibilityRulesSerializer,
        SECTION_AUTO_MATCHING: AutoMatchingSettingsSerializer,
        SECTION_LOCALIZATION: LocalizationSettingsSerializer,
        SECTION_SECURITY: SecuritySettingsSerializer,
    }

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")

    def _section_handler(self, request, section):
        serializer_class = self.section_serializers[section]

        if request.method == "GET":
            return Response(get_section(section, mask_sensitive=True), status=status.HTTP_200_OK)

        serializer = serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated = update_section(
            section=section,
            payload=serializer.validated_data,
            user=request.user,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        return Response(mask_sensitive_values(section, updated), status=status.HTTP_200_OK)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="general")
    def general(self, request):
        return self._section_handler(request, SECTION_GENERAL)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="user-roles")
    def user_roles(self, request):
        return self._section_handler(request, SECTION_USER_ROLES)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="notifications")
    def notifications(self, request):
        return self._section_handler(request, SECTION_NOTIFICATIONS)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="emergency-alerts")
    def emergency_alerts(self, request):
        return self._section_handler(request, SECTION_EMERGENCY_ALERTS)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="blood-request-rules")
    def blood_request_rules(self, request):
        return self._section_handler(request, SECTION_BLOOD_REQUEST_RULES)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="donor-eligibility")
    def donor_eligibility(self, request):
        return self._section_handler(request, SECTION_DONOR_ELIGIBILITY)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="auto-matching")
    def auto_matching(self, request):
        return self._section_handler(request, SECTION_AUTO_MATCHING)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="localization")
    def localization(self, request):
        return self._section_handler(request, SECTION_LOCALIZATION)

    @method_decorator(never_cache)
    @action(detail=False, methods=["get", "put"], url_path="security")
    def security(self, request):
        return self._section_handler(request, SECTION_SECURITY)

    @action(detail=False, methods=["post"], url_path="notifications/test-email")
    def test_email(self, request):
        serializer = TestChannelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_settings = get_section(SECTION_NOTIFICATIONS, mask_sensitive=False)
        if not notification_settings.get("email_enabled"):
            return Response(
                {"detail": "Email notifications are disabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Email test request accepted."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="notifications/test-sms")
    def test_sms(self, request):
        serializer = TestChannelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_settings = get_section(SECTION_NOTIFICATIONS, mask_sensitive=False)
        if not notification_settings.get("sms_enabled"):
            return Response(
                {"detail": "SMS notifications are disabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "SMS test request accepted."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="audit-logs")
    def audit_logs(self, request):
        queryset = SystemSettingsAuditLog.objects.select_related("changed_by").all()

        section = request.query_params.get("section")
        if section:
            queryset = queryset.filter(section=section)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = SystemSettingsAuditLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=["post"], url_path="reset-section")
    def reset_section_action(self, request):
        serializer = ResetSectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section = serializer.validated_data["section"]
        data = reset_section(
            section=section,
            user=request.user,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        return Response(mask_sensitive_values(section, data), status=status.HTTP_200_OK)
