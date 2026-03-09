from datetime import datetime, time

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import SettingAuditLog, Settings
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from core.serializers_settings import (
    GeneralSettingsSerializer,
    LocalizationSettingsSerializer,
    NotificationSettingsSerializer,
    SecuritySettingsSerializer,
    SettingAuditLogSerializer,
    TestEmailSerializer,
    TestSmsSerializer,
)
from core.services.settings_defaults import SETTINGS_SECTION_KEYS
from core.services.settings_service import (
    can_user_edit_settings,
    get_public_section_payload,
    get_runtime_notification_settings,
    get_section_last_updated,
    get_section_meta,
    is_live_section,
    update_section,
)


class LegacyShopSettingsSerializer(serializers.Serializer):
    shop_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)


class LegacyEmailSettingsSerializer(serializers.Serializer):
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.IntegerField(required=False, min_value=1, max_value=65535)
    smtp_username = serializers.CharField(required=False, allow_blank=True)
    smtp_password = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    from_email = serializers.EmailField(required=False, allow_blank=True)


class SettingsViewSet(PermissionMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "settings"

    def _section_payload(self, section: str):
        payload = get_public_section_payload(section)
        last_updated = get_section_last_updated(section)
        return {
            "section": section,
            "implemented": is_live_section(section),
            "title": get_section_meta(section).get("title"),
            "data": payload,
            "last_updated": last_updated.isoformat() if last_updated else None,
        }

    def _live_section_get_put(self, request, section: str, serializer_class):
        if request.method == "GET":
            return Response(get_public_section_payload(section), status=status.HTTP_200_OK)

        serializer = serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated = update_section(
            section,
            serializer.validated_data,
            user=request.user,
            request=request,
        )
        return Response(updated, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        sections = {}
        for section in SETTINGS_SECTION_KEYS:
            sections[section] = self._section_payload(section)

        return Response(
            {
                "sections": sections,
                "permissions": {"canEdit": can_user_edit_settings(request.user)},
                "meta": {"generated_at": timezone.now().isoformat()},
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get", "put"], url_path="general")
    def general(self, request):
        return self._live_section_get_put(request, "general", GeneralSettingsSerializer)

    @action(detail=False, methods=["get", "put"], url_path="notifications")
    def notifications(self, request):
        return self._live_section_get_put(request, "notifications", NotificationSettingsSerializer)

    @action(detail=False, methods=["post"], url_path="notifications/test-email", permission_action="change")
    def test_notification_email(self, request):
        serializer = TestEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        runtime = get_runtime_notification_settings()
        if not runtime.get("email_enabled", True):
            return Response({"detail": "Email notifications are disabled."}, status=status.HTTP_400_BAD_REQUEST)

        recipient = serializer.validated_data.get("test_to") or request.user.email
        if not recipient:
            return Response({"detail": "No email recipient provided."}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.mail import send_mail

        try:
            send_mail(
                subject="Blood Donation System - Test Email",
                message="This is a test email from settings module.",
                from_email=runtime.get("from_email") or None,
                recipient_list=[recipient],
                fail_silently=False,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": f"Test email sent to {recipient}."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="notifications/test-sms", permission_action="change")
    def test_notification_sms(self, request):
        serializer = TestSmsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        runtime = get_runtime_notification_settings()
        if not runtime.get("sms_enabled", False):
            return Response({"detail": "SMS notifications are disabled."}, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data.get("phone") or request.user.phone
        if not phone:
            return Response({"detail": "No phone number provided."}, status=status.HTTP_400_BAD_REQUEST)

        account_sid = runtime.get("sms_account_sid")
        auth_token = runtime.get("sms_auth_token")
        from_number = runtime.get("sms_from_number")

        if not account_sid or not auth_token or not from_number:
            return Response({"detail": "SMS credentials are missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from twilio.rest import Client

            client = Client(account_sid, auth_token)
            result = client.messages.create(
                to=phone,
                from_=from_number,
                body="Blood Donation System test SMS from settings module.",
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "detail": f"Test SMS sent to {phone}.",
                "sid": result.sid,
                "status": result.status,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get", "put"], url_path="localization")
    def localization(self, request):
        return self._live_section_get_put(request, "localization", LocalizationSettingsSerializer)

    @action(detail=False, methods=["get", "put"], url_path="security")
    def security(self, request):
        return self._live_section_get_put(request, "security", SecuritySettingsSerializer)

    @action(detail=False, methods=["get"], url_path="user-roles")
    def user_roles(self, request):
        return Response(self._section_payload("user_roles"), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="emergency-alerts")
    def emergency_alerts(self, request):
        return Response(self._section_payload("emergency_alerts"), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="blood-request-rules")
    def blood_request_rules(self, request):
        return Response(self._section_payload("blood_request_rules"), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="donor-eligibility")
    def donor_eligibility(self, request):
        return Response(self._section_payload("donor_eligibility"), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="auto-matching")
    def auto_matching(self, request):
        return Response(self._section_payload("auto_matching"), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="audit-logs")
    def audit_logs(self, request):
        queryset = SettingAuditLog.objects.select_related("changed_by").all()

        section = request.query_params.get("section")
        if section:
            queryset = queryset.filter(section=section)

        date_from_raw = request.query_params.get("date_from")
        if date_from_raw:
            dt = parse_datetime(date_from_raw)
            if dt is None:
                d = parse_date(date_from_raw)
                if d:
                    dt = datetime.combine(d, time.min, tzinfo=timezone.get_current_timezone())
            if dt is not None:
                queryset = queryset.filter(changed_at__gte=dt)

        date_to_raw = request.query_params.get("date_to")
        if date_to_raw:
            dt = parse_datetime(date_to_raw)
            if dt is None:
                d = parse_date(date_to_raw)
                if d:
                    dt = datetime.combine(d, time.max, tzinfo=timezone.get_current_timezone())
            if dt is not None:
                queryset = queryset.filter(changed_at__lte=dt)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = SettingAuditLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # Backward-compatible endpoints -------------------------------------------------

    @action(detail=False, methods=["get", "put"], url_path="shop")
    def shop_settings(self, request):
        if request.method == "GET":
            general = get_public_section_payload("general")
            data = {
                "shop_name": general.get("organization_name", ""),
                "phone_number": general.get("support_phone", ""),
                "contact_email": general.get("support_email", ""),
                "address": general.get("address", ""),
            }
            return Response(data, status=status.HTTP_200_OK)

        serializer = LegacyShopSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        mapped = {
            "organization_name": serializer.validated_data.get("shop_name"),
            "support_phone": serializer.validated_data.get("phone_number"),
            "support_email": serializer.validated_data.get("contact_email"),
            "address": serializer.validated_data.get("address"),
        }
        update_section(
            "general",
            {key: value for key, value in mapped.items() if value is not None},
            user=request.user,
            request=request,
        )

        general = get_public_section_payload("general")
        return Response(
            {
                "shop_name": general.get("organization_name", ""),
                "phone_number": general.get("support_phone", ""),
                "contact_email": general.get("support_email", ""),
                "address": general.get("address", ""),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get", "put"], url_path="email")
    def email_settings(self, request):
        if request.method == "GET":
            notifications = get_public_section_payload("notifications")
            return Response(
                {
                    "smtp_host": notifications.get("smtp_host", ""),
                    "smtp_port": notifications.get("smtp_port", 587),
                    "smtp_username": notifications.get("smtp_username", ""),
                    "smtp_password": None,
                    "from_email": notifications.get("from_email", ""),
                },
                status=status.HTTP_200_OK,
            )

        serializer = LegacyEmailSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        mapped = {
            key: serializer.validated_data[key]
            for key in ["smtp_host", "smtp_port", "smtp_username", "smtp_password", "from_email"]
            if key in serializer.validated_data
        }
        update_section("notifications", mapped, user=request.user, request=request)

        notifications = get_public_section_payload("notifications")
        return Response(
            {
                "smtp_host": notifications.get("smtp_host", ""),
                "smtp_port": notifications.get("smtp_port", 587),
                "smtp_username": notifications.get("smtp_username", ""),
                "smtp_password": None,
                "from_email": notifications.get("from_email", ""),
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get", "put"],
        url_path="logo",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def logo_settings(self, request):
        general = get_public_section_payload("general")

        if request.method == "GET":
            logo_url = general.get("logo_url") or None
            if not logo_url:
                try:
                    logo_setting = Settings.objects.get(setting_key="shop_logo", setting_type="image")
                    if logo_setting.setting_image:
                        logo_url = request.build_absolute_uri(logo_setting.setting_image.url)
                except Settings.DoesNotExist:
                    logo_url = None

            return Response(
                {
                    "logo": logo_url,
                    "shop_name": general.get("organization_name", ""),
                },
                status=status.HTTP_200_OK,
            )

        file = request.FILES.get("logo")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        setting, _ = Settings.objects.get_or_create(
            setting_key="shop_logo",
            defaults={
                "setting_type": "image",
                "category": "general",
                "description": "Organization logo",
            },
        )
        setting.setting_type = "image"
        setting.setting_image = file
        setting.save(update_fields=["setting_type", "setting_image", "updated_at"])

        logo_url = request.build_absolute_uri(setting.setting_image.url)
        update_section("general", {"logo_url": logo_url}, user=request.user, request=request)

        return Response({"logo": logo_url}, status=status.HTTP_200_OK)


class InitializeView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_get_initial_data(request), status=status.HTTP_200_OK)


def _get_initial_data(request):
    return {
        "settings": _get_settings(request),
    }


def _get_settings(request):
    general = get_public_section_payload("general")
    notifications = get_public_section_payload("notifications")

    logo_url = general.get("logo_url") or None
    if not logo_url:
        try:
            logo_setting = Settings.objects.get(setting_key="shop_logo", setting_type="image")
            if logo_setting.setting_image:
                logo_url = request.build_absolute_uri(logo_setting.setting_image.url)
        except Settings.DoesNotExist:
            logo_url = None

    return {
        "shop_settings": {
            "shop_name": general.get("organization_name", ""),
            "phone_number": general.get("support_phone", ""),
            "contact_email": general.get("support_email", ""),
            "address": general.get("address", ""),
        },
        "logo_settings": {
            "logo": logo_url,
            "shop_name": general.get("organization_name", ""),
        },
        "email_settings": {
            "smtp_host": notifications.get("smtp_host", ""),
            "smtp_port": notifications.get("smtp_port", 587),
            "smtp_username": notifications.get("smtp_username", ""),
            "smtp_password": None,
            "from_email": notifications.get("from_email", ""),
        },
    }
