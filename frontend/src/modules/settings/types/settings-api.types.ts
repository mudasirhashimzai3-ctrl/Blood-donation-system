import type {
  AutoMatchingSettings,
  BloodRequestRulesSettings,
  DonorEligibilitySettings,
  EmergencyAlertSettings,
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  SecuritySettings,
  SettingsSection,
  UserRoleSettings,
} from "./settings.types";

export type SectionResponseMap = {
  general: GeneralSettings;
  user_roles: UserRoleSettings;
  notifications: NotificationSettings;
  emergency_alerts: EmergencyAlertSettings;
  blood_request_rules: BloodRequestRulesSettings;
  donor_eligibility: DonorEligibilitySettings;
  auto_matching: AutoMatchingSettings;
  localization: LocalizationSettings;
  security: SecuritySettings;
};

export type SectionPayload<T extends SettingsSection> = SectionResponseMap[T];

export interface ResetSectionPayload {
  section: SettingsSection;
}
