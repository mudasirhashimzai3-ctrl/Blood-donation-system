SECTION_GENERAL = "general"
SECTION_USER_ROLES = "user_roles"
SECTION_NOTIFICATIONS = "notifications"
SECTION_EMERGENCY_ALERTS = "emergency_alerts"
SECTION_BLOOD_REQUEST_RULES = "blood_request_rules"
SECTION_DONOR_ELIGIBILITY = "donor_eligibility"
SECTION_AUTO_MATCHING = "auto_matching"
SECTION_LOCALIZATION = "localization"
SECTION_SECURITY = "security"

SECTIONS = [
    SECTION_GENERAL,
    SECTION_USER_ROLES,
    SECTION_NOTIFICATIONS,
    SECTION_EMERGENCY_ALERTS,
    SECTION_BLOOD_REQUEST_RULES,
    SECTION_DONOR_ELIGIBILITY,
    SECTION_AUTO_MATCHING,
    SECTION_LOCALIZATION,
    SECTION_SECURITY,
]

SECTION_KEYS = {
    SECTION_GENERAL: "settings.general",
    SECTION_USER_ROLES: "settings.user_roles",
    SECTION_NOTIFICATIONS: "settings.notifications",
    SECTION_EMERGENCY_ALERTS: "settings.emergency_alerts",
    SECTION_BLOOD_REQUEST_RULES: "settings.blood_request_rules",
    SECTION_DONOR_ELIGIBILITY: "settings.donor_eligibility",
    SECTION_AUTO_MATCHING: "settings.auto_matching",
    SECTION_LOCALIZATION: "settings.localization",
    SECTION_SECURITY: "settings.security",
}

SECTION_CATEGORIES = {
    SECTION_GENERAL: "general",
    SECTION_USER_ROLES: "security",
    SECTION_NOTIFICATIONS: "notifications",
    SECTION_EMERGENCY_ALERTS: "integration",
    SECTION_BLOOD_REQUEST_RULES: "integration",
    SECTION_DONOR_ELIGIBILITY: "integration",
    SECTION_AUTO_MATCHING: "integration",
    SECTION_LOCALIZATION: "general",
    SECTION_SECURITY: "security",
}

SECTION_DEFAULTS = {
    SECTION_GENERAL: {
        "organization_name": "",
        "support_email": "",
        "support_phone": "",
        "address": "",
        "logo_url": "",
        "default_country": "",
        "maintenance_mode": False,
    },
    SECTION_USER_ROLES: {
        "allow_user_invite": True,
        "default_new_user_role": "receptionist",
        "allow_role_editing": False,
        "allow_self_profile_edit": True,
        "enforce_2fa_for_admin": False,
    },
    SECTION_NOTIFICATIONS: {
        "email_enabled": True,
        "email_provider": "smtp",
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_username": "",
        "smtp_password": "",
        "sms_enabled": False,
        "sms_provider": "twilio",
        "sms_sender_id": "",
        "sms_auth_token": "",
        "in_app_enabled": True,
        "notification_retention_days": 90,
    },
    SECTION_EMERGENCY_ALERTS: {
        "emergency_mode_enabled": True,
        "escalation_levels": ["critical", "urgent", "normal"],
        "auto_notify_nearby_donors": True,
        "donor_radius_km": 30.0,
        "hospital_broadcast_enabled": True,
        "alert_throttle_minutes": 15,
    },
    SECTION_BLOOD_REQUEST_RULES: {
        "max_units_per_request": 8,
        "require_medical_report": True,
        "auto_expire_hours": 24,
        "allow_duplicate_active_request": False,
        "verification_required_for_critical": True,
    },
    SECTION_DONOR_ELIGIBILITY: {
        "min_age": 18,
        "max_age": 60,
        "min_weight_kg": 50.0,
        "min_gap_days_between_donations": 56,
        "hemoglobin_min": 12.5,
        "block_if_recent_infection_days": 14,
    },
    SECTION_AUTO_MATCHING: {
        "enabled": True,
        "max_distance_km": 30.0,
        "prioritize_rare_blood_groups": True,
        "prioritize_recently_active_donors": True,
        "max_candidates_to_notify": 50,
        "retry_interval_minutes": 30,
    },
    SECTION_LOCALIZATION: {
        "default_language": "en",
        "supported_languages": ["en", "da", "pa"],
        "default_timezone": "UTC",
        "date_format": "YYYY-MM-DD",
        "time_format_24h": True,
        "first_day_of_week": "monday",
    },
    SECTION_SECURITY: {
        "password_min_length": 8,
        "password_require_uppercase": True,
        "password_require_number": True,
        "password_require_special_char": False,
        "password_expiry_days": 90,
        "max_login_attempts": 5,
        "lockout_minutes": 30,
        "session_timeout_minutes": 30,
        "force_logout_on_password_change": True,
    },
}

SENSITIVE_FIELDS_BY_SECTION = {
    SECTION_NOTIFICATIONS: ["smtp_password", "sms_auth_token"],
}
