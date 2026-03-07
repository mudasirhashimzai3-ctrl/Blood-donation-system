from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from rest_framework import serializers

from system_settings.constants import SECTIONS
from system_settings.models import SystemSettingsAuditLog


LANGUAGE_CHOICES = ["en", "da", "pa", "ar", "fr", "de", "es"]
EMAIL_PROVIDER_CHOICES = ["smtp", "sendgrid", "ses", "custom"]
SMS_PROVIDER_CHOICES = ["twilio", "vonage", "custom"]
DATE_FORMAT_CHOICES = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]
FIRST_DAY_CHOICES = ["monday", "sunday", "saturday"]
ROLE_CHOICES = ["admin", "receptionist", "viewer"]


class GeneralSettingsSerializer(serializers.Serializer):
    organization_name = serializers.CharField(required=False, allow_blank=True, max_length=200)
    support_email = serializers.EmailField(required=False, allow_blank=True)
    support_phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    address = serializers.CharField(required=False, allow_blank=True)
    logo_url = serializers.CharField(required=False, allow_blank=True)
    default_country = serializers.CharField(required=False, allow_blank=True, max_length=100)
    maintenance_mode = serializers.BooleanField(required=False)


class UserRoleSettingsSerializer(serializers.Serializer):
    allow_user_invite = serializers.BooleanField(required=False)
    default_new_user_role = serializers.ChoiceField(required=False, choices=ROLE_CHOICES)
    allow_role_editing = serializers.BooleanField(required=False)
    allow_self_profile_edit = serializers.BooleanField(required=False)
    enforce_2fa_for_admin = serializers.BooleanField(required=False)


class NotificationSettingsSerializer(serializers.Serializer):
    email_enabled = serializers.BooleanField(required=False)
    email_provider = serializers.ChoiceField(required=False, choices=EMAIL_PROVIDER_CHOICES)
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.IntegerField(required=False, min_value=1, max_value=65535)
    smtp_username = serializers.CharField(required=False, allow_blank=True)
    smtp_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    sms_enabled = serializers.BooleanField(required=False)
    sms_provider = serializers.ChoiceField(required=False, choices=SMS_PROVIDER_CHOICES)
    sms_sender_id = serializers.CharField(required=False, allow_blank=True)
    sms_auth_token = serializers.CharField(required=False, allow_blank=True, write_only=True)
    in_app_enabled = serializers.BooleanField(required=False)
    notification_retention_days = serializers.IntegerField(required=False, min_value=1, max_value=3650)

    def validate(self, attrs):
        if attrs.get("email_enabled") and attrs.get("email_provider") == "smtp":
            if "smtp_host" in attrs and attrs.get("smtp_host") == "":
                raise serializers.ValidationError({"smtp_host": "SMTP host is required when email is enabled."})
        return attrs


class EmergencyAlertSettingsSerializer(serializers.Serializer):
    emergency_mode_enabled = serializers.BooleanField(required=False)
    escalation_levels = serializers.ListField(
        required=False,
        child=serializers.CharField(max_length=32),
        allow_empty=False,
    )
    auto_notify_nearby_donors = serializers.BooleanField(required=False)
    donor_radius_km = serializers.FloatField(required=False, min_value=1, max_value=500)
    hospital_broadcast_enabled = serializers.BooleanField(required=False)
    alert_throttle_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)


class BloodRequestRulesSerializer(serializers.Serializer):
    max_units_per_request = serializers.IntegerField(required=False, min_value=1, max_value=20)
    require_medical_report = serializers.BooleanField(required=False)
    auto_expire_hours = serializers.IntegerField(required=False, min_value=1, max_value=336)
    allow_duplicate_active_request = serializers.BooleanField(required=False)
    verification_required_for_critical = serializers.BooleanField(required=False)


class DonorEligibilityRulesSerializer(serializers.Serializer):
    min_age = serializers.IntegerField(required=False, min_value=18, max_value=100)
    max_age = serializers.IntegerField(required=False, min_value=18, max_value=120)
    min_weight_kg = serializers.FloatField(required=False, min_value=30, max_value=250)
    min_gap_days_between_donations = serializers.IntegerField(required=False, min_value=1, max_value=365)
    hemoglobin_min = serializers.FloatField(required=False, min_value=1, max_value=25)
    block_if_recent_infection_days = serializers.IntegerField(required=False, min_value=0, max_value=365)

    def validate(self, attrs):
        min_age = attrs.get("min_age")
        max_age = attrs.get("max_age")
        if min_age is not None and max_age is not None and max_age < min_age:
            raise serializers.ValidationError({"max_age": "max_age must be greater than or equal to min_age."})
        return attrs


class AutoMatchingSettingsSerializer(serializers.Serializer):
    enabled = serializers.BooleanField(required=False)
    max_distance_km = serializers.FloatField(required=False, min_value=1, max_value=1000)
    prioritize_rare_blood_groups = serializers.BooleanField(required=False)
    prioritize_recently_active_donors = serializers.BooleanField(required=False)
    max_candidates_to_notify = serializers.IntegerField(required=False, min_value=1, max_value=1000)
    retry_interval_minutes = serializers.IntegerField(required=False, min_value=1, max_value=10080)


class LocalizationSettingsSerializer(serializers.Serializer):
    default_language = serializers.ChoiceField(required=False, choices=LANGUAGE_CHOICES)
    supported_languages = serializers.ListField(
        required=False,
        child=serializers.ChoiceField(choices=LANGUAGE_CHOICES),
        allow_empty=False,
    )
    default_timezone = serializers.CharField(required=False, max_length=64)
    date_format = serializers.ChoiceField(required=False, choices=DATE_FORMAT_CHOICES)
    time_format_24h = serializers.BooleanField(required=False)
    first_day_of_week = serializers.ChoiceField(required=False, choices=FIRST_DAY_CHOICES)

    def validate_default_timezone(self, value):
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise serializers.ValidationError("Invalid timezone") from exc
        return value

    def validate(self, attrs):
        default_language = attrs.get("default_language")
        supported_languages = attrs.get("supported_languages")
        if default_language and supported_languages and default_language not in supported_languages:
            raise serializers.ValidationError({
                "supported_languages": "default_language must exist in supported_languages.",
            })
        return attrs


class SecuritySettingsSerializer(serializers.Serializer):
    password_min_length = serializers.IntegerField(required=False, min_value=8, max_value=128)
    password_require_uppercase = serializers.BooleanField(required=False)
    password_require_number = serializers.BooleanField(required=False)
    password_require_special_char = serializers.BooleanField(required=False)
    password_expiry_days = serializers.IntegerField(required=False, min_value=0, max_value=3650)
    max_login_attempts = serializers.IntegerField(required=False, min_value=3, max_value=20)
    lockout_minutes = serializers.IntegerField(required=False, min_value=1, max_value=1440)
    session_timeout_minutes = serializers.IntegerField(required=False, min_value=5, max_value=1440)
    force_logout_on_password_change = serializers.BooleanField(required=False)


class ResetSectionSerializer(serializers.Serializer):
    section = serializers.ChoiceField(choices=SECTIONS)


class TestChannelSerializer(serializers.Serializer):
    recipient = serializers.CharField(required=False, allow_blank=True)


class SystemSettingsAuditLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemSettingsAuditLog
        fields = [
            "id",
            "section",
            "old_value",
            "new_value",
            "changed_by",
            "changed_by_name",
            "ip_address",
            "user_agent",
            "reset_to_default",
            "created_at",
        ]

    def get_changed_by_name(self, obj):
        if not obj.changed_by:
            return None
        return obj.changed_by.get_full_name() or obj.changed_by.username
