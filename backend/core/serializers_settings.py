from zoneinfo import ZoneInfo

from rest_framework import serializers

from core.models import SettingAuditLog

SUPPORTED_LANGUAGES = ("en", "da", "pa")
WEEK_DAYS = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)


class GeneralSettingsSerializer(serializers.Serializer):
    organization_name = serializers.CharField(required=False, allow_blank=True)
    support_email = serializers.EmailField(required=False, allow_blank=True)
    support_phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    logo_url = serializers.CharField(required=False, allow_blank=True)
    maintenance_mode = serializers.BooleanField(required=False)


class NotificationSettingsSerializer(serializers.Serializer):
    email_enabled = serializers.BooleanField(required=False)
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.IntegerField(required=False, min_value=1, max_value=65535)
    smtp_username = serializers.CharField(required=False, allow_blank=True)
    smtp_password = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        write_only=True,
    )
    from_email = serializers.EmailField(required=False, allow_blank=True)

    sms_enabled = serializers.BooleanField(required=False)
    sms_account_sid = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        write_only=True,
    )
    sms_auth_token = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        write_only=True,
    )
    sms_from_number = serializers.CharField(required=False, allow_blank=True)

    in_app_enabled = serializers.BooleanField(required=False)
    notification_retention_days = serializers.IntegerField(required=False, min_value=1, max_value=3650)


class LocalizationSettingsSerializer(serializers.Serializer):
    default_language = serializers.ChoiceField(required=False, choices=SUPPORTED_LANGUAGES)
    supported_languages = serializers.ListField(
        required=False,
        child=serializers.ChoiceField(choices=SUPPORTED_LANGUAGES),
    )
    default_timezone = serializers.CharField(required=False)
    date_format = serializers.CharField(required=False)
    time_format_24h = serializers.BooleanField(required=False)
    first_day_of_week = serializers.ChoiceField(required=False, choices=WEEK_DAYS)

    def validate_default_timezone(self, value):
        try:
            ZoneInfo(value)
        except Exception as exc:  # pragma: no cover
            raise serializers.ValidationError("Invalid IANA timezone") from exc
        return value


class SecuritySettingsSerializer(serializers.Serializer):
    password_min_length = serializers.IntegerField(required=False, min_value=6, max_value=128)
    password_require_uppercase = serializers.BooleanField(required=False)
    password_require_number = serializers.BooleanField(required=False)
    password_require_special_char = serializers.BooleanField(required=False)
    max_login_attempts = serializers.IntegerField(required=False, min_value=3, max_value=20)
    lockout_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)
    session_timeout_minutes = serializers.IntegerField(required=False, min_value=5, max_value=1440)
    force_logout_on_password_change = serializers.BooleanField(required=False)


class SettingsSectionSerializer(serializers.Serializer):
    section = serializers.CharField()
    implemented = serializers.BooleanField()
    data = serializers.DictField()
    last_updated = serializers.DateTimeField(allow_null=True)


class TestEmailSerializer(serializers.Serializer):
    test_to = serializers.EmailField(required=False)


class TestSmsSerializer(serializers.Serializer):
    phone = serializers.CharField(required=False)


class SettingAuditLogSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source="changed_by.username", read_only=True)

    class Meta:
        model = SettingAuditLog
        fields = [
            "id",
            "section",
            "old_value",
            "new_value",
            "changed_by",
            "changed_by_username",
            "ip_address",
            "user_agent",
            "changed_at",
        ]
