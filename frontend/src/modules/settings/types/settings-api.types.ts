import type {
  AutoMatchingSettings,
  BloodRequestRuleSettings,
  DonorEligibilitySettings,
  EmergencyAlertSettings,
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  SecuritySettings,
  SettingsSection,
  UserRoleSettings,
} from "./settings.types";

export interface SectionEnvelope<TData> {
  section: SettingsSection;
  implemented: boolean;
  title: string;
  data: TData;
  last_updated: string | null;
}

export interface SettingsOverviewResponse {
  sections: {
    general: SectionEnvelope<GeneralSettings>;
    user_roles: SectionEnvelope<UserRoleSettings>;
    notifications: SectionEnvelope<NotificationSettings>;
    emergency_alerts: SectionEnvelope<EmergencyAlertSettings>;
    blood_request_rules: SectionEnvelope<BloodRequestRuleSettings>;
    donor_eligibility: SectionEnvelope<DonorEligibilitySettings>;
    auto_matching: SectionEnvelope<AutoMatchingSettings>;
    localization: SectionEnvelope<LocalizationSettings>;
    security: SectionEnvelope<SecuritySettings>;
  };
  permissions: {
    canEdit: boolean;
  };
  meta: {
    generated_at: string;
  };
}

export interface SettingAuditLog {
  id: number;
  section: SettingsSection;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  changed_by: number | null;
  changed_by_username: string | null;
  ip_address: string | null;
  user_agent: string;
  changed_at: string;
}

export interface PaginatedSettingAuditLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: SettingAuditLog[];
}

export type TestEmailPayload = {
  test_to?: string;
};

export type TestSmsPayload = {
  phone?: string;
};
