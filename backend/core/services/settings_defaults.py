from copy import deepcopy

SETTINGS_SECTION_KEYS = {
    "general": "settings.general",
    "user_roles": "settings.user_roles",
    "notifications": "settings.notifications",
    "emergency_alerts": "settings.emergency_alerts",
    "blood_request_rules": "settings.blood_request_rules",
    "donor_eligibility": "settings.donor_eligibility",
    "auto_matching": "settings.auto_matching",
    "localization": "settings.localization",
    "security": "settings.security",
}

LIVE_SECTIONS = (
    "general",
    "notifications",
    "localization",
    "security",
)

SECTION_META = {
    "general": {"implemented": True, "title": "System General Settings"},
    "user_roles": {"implemented": False, "title": "User & Role Management Settings"},
    "notifications": {"implemented": True, "title": "Notification Settings"},
    "emergency_alerts": {"implemented": False, "title": "Emergency Alert Settings"},
    "blood_request_rules": {"implemented": False, "title": "Blood Request Rules"},
    "donor_eligibility": {"implemented": False, "title": "Donor Eligibility Rules"},
    "auto_matching": {"implemented": False, "title": "Auto Matching Settings"},
    "localization": {"implemented": True, "title": "Language & Timezone Settings"},
    "security": {"implemented": True, "title": "Security Settings"},
}

SECRET_FIELDS_BY_SECTION = {
    "notifications": ["smtp_password", "sms_account_sid", "sms_auth_token"],
}

SECTION_DEFAULTS = {
    "general": {
        "organization_name": "",
        "support_email": "",
        "support_phone": "",
        "address": "",
        "logo_url": "",
        "maintenance_mode": False,
    },
    "user_roles": {
        "allow_user_invite": True,
        "default_new_user_role": "viewer",
        "allow_role_editing": False,
        "allow_self_profile_edit": True,
        "enforce_2fa_for_admin": False,
    },
    "notifications": {
        "email_enabled": True,
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_username": "",
        "smtp_password": "",
        "from_email": "",
        "sms_enabled": False,
        "sms_account_sid": "",
        "sms_auth_token": "",
        "sms_from_number": "",
        "in_app_enabled": True,
        "notification_retention_days": 30,
    },
    "emergency_alerts": {
        "emergency_mode_enabled": True,
        "escalation_levels": 3,
        "auto_notify_nearby_donors": True,
        "donor_radius_km": 10,
        "hospital_broadcast_enabled": True,
        "alert_throttle_minutes": 5,
    },
    "blood_request_rules": {
        "max_units_per_request": 4,
        "require_medical_report": False,
        "auto_expire_hours": 24,
        "allow_duplicate_active_request": False,
        "verification_required_for_critical": True,
    },
    "donor_eligibility": {
        "min_age": 18,
        "max_age": 65,
        "min_weight_kg": 50,
        "min_gap_days_between_donations": 56,
        "hemoglobin_min": 12.5,
        "block_if_recent_infection_days": 14,
    },
    "auto_matching": {
        "enabled": True,
        "max_distance_km": 10,
        "prioritize_rare_blood_groups": True,
        "prioritize_recently_active_donors": True,
        "max_candidates_to_notify": 50,
        "retry_interval_minutes": 10,
    },
    "localization": {
        "default_language": "en",
        "supported_languages": ["en", "da", "pa"],
        "default_timezone": "UTC",
        "date_format": "yyyy-MM-dd",
        "time_format_24h": True,
        "first_day_of_week": "monday",
    },
    "security": {
        "password_min_length": 8,
        "password_require_uppercase": True,
        "password_require_number": True,
        "password_require_special_char": False,
        "max_login_attempts": 5,
        "lockout_minutes": 30,
        "session_timeout_minutes": 30,
        "force_logout_on_password_change": True,
    },
}

ENV_OVERRIDE_RULES = {
    "notifications": {
        "smtp_host": ("EMAIL_HOST", str),
        "smtp_port": ("EMAIL_PORT", int),
        "smtp_username": ("EMAIL_HOST_USER", str),
        "smtp_password": ("EMAIL_HOST_PASSWORD", str),
        "from_email": ("DEFAULT_FROM_EMAIL", str),
        "sms_account_sid": ("TWILIO_ACCOUNT_SID", str),
        "sms_auth_token": ("TWILIO_AUTH_TOKEN", str),
        "sms_from_number": ("TWILIO_FROM_NUMBER", str),
    }
}


def get_default_section_payload(section: str) -> dict:
    return deepcopy(SECTION_DEFAULTS[section])
