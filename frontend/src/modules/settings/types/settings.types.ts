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
  default_country: string;
  maintenance_mode: boolean;
}

export interface UserRoleSettings {
  allow_user_invite: boolean;
  default_new_user_role: "admin" | "receptionist" | "viewer";
  allow_role_editing: boolean;
  allow_self_profile_edit: boolean;
  enforce_2fa_for_admin: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  email_provider: "smtp" | "sendgrid" | "ses" | "custom";
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string | null;
  sms_enabled: boolean;
  sms_provider: "twilio" | "vonage" | "custom";
  sms_sender_id: string;
  sms_auth_token?: string | null;
  in_app_enabled: boolean;
  notification_retention_days: number;
}

export interface EmergencyAlertSettings {
  emergency_mode_enabled: boolean;
  escalation_levels: string[];
  auto_notify_nearby_donors: boolean;
  donor_radius_km: number;
  hospital_broadcast_enabled: boolean;
  alert_throttle_minutes: number;
}

export interface BloodRequestRulesSettings {
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

export interface LocalizationSettings {
  default_language: "en" | "da" | "pa" | "ar" | "fr" | "de" | "es";
  supported_languages: Array<"en" | "da" | "pa" | "ar" | "fr" | "de" | "es">;
  default_timezone: string;
  date_format: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  time_format_24h: boolean;
  first_day_of_week: "monday" | "sunday" | "saturday";
}

export interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_number: boolean;
  password_require_special_char: boolean;
  password_expiry_days: number;
  max_login_attempts: number;
  lockout_minutes: number;
  session_timeout_minutes: number;
  force_logout_on_password_change: boolean;
}

export interface SettingsAuditLog {
  id: number;
  section: SettingsSection;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  changed_by: number | null;
  changed_by_name: string | null;
  ip_address: string | null;
  user_agent: string;
  reset_to_default: boolean;
  created_at: string;
}

export interface PaginatedAuditLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: SettingsAuditLog[];
}
