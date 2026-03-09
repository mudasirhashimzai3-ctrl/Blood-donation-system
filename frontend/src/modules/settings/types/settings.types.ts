export type SettingsSection =
  | "general"
  | "user_roles"
  | "notifications"
  | "emergency_alerts"
  | "blood_request_rules"
  | "donor_eligibility"
  | "auto_matching"
  | "localization"
  | "security";

export interface GeneralSettings {
  organization_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  logo_url: string;
  maintenance_mode: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  has_smtp_password?: boolean;
  smtp_password_masked?: string | null;
  from_email: string;
  sms_enabled: boolean;
  sms_account_sid: string;
  has_sms_account_sid?: boolean;
  sms_account_sid_masked?: string | null;
  sms_auth_token: string;
  has_sms_auth_token?: boolean;
  sms_auth_token_masked?: string | null;
  sms_from_number: string;
  in_app_enabled: boolean;
  notification_retention_days: number;
}

export interface LocalizationSettings {
  default_language: "en" | "da" | "pa";
  supported_languages: Array<"en" | "da" | "pa">;
  default_timezone: string;
  date_format: string;
  time_format_24h: boolean;
  first_day_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

export interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_number: boolean;
  password_require_special_char: boolean;
  max_login_attempts: number;
  lockout_minutes: number;
  session_timeout_minutes: number;
  force_logout_on_password_change: boolean;
}

export interface UserRoleSettings {
  allow_user_invite: boolean;
  default_new_user_role: string;
  allow_role_editing: boolean;
  allow_self_profile_edit: boolean;
  enforce_2fa_for_admin: boolean;
}

export interface EmergencyAlertSettings {
  emergency_mode_enabled: boolean;
  escalation_levels: number;
  auto_notify_nearby_donors: boolean;
  donor_radius_km: number;
  hospital_broadcast_enabled: boolean;
  alert_throttle_minutes: number;
}

export interface BloodRequestRuleSettings {
  max_units_per_request: number;
  require_medical_report: boolean;
  auto_expire_hours: number;
  allow_duplicate_active_request: boolean;
  verification_required_for_critical: boolean;
}

export interface DonorEligibilitySettings {
  min_age: number;
  max_age: number;
  min_weight_kg: number;
  min_gap_days_between_donations: number;
  hemoglobin_min: number;
  block_if_recent_infection_days: number;
}

export interface AutoMatchingSettings {
  enabled: boolean;
  max_distance_km: number;
  prioritize_rare_blood_groups: boolean;
  prioritize_recently_active_donors: boolean;
  max_candidates_to_notify: number;
  retry_interval_minutes: number;
}
