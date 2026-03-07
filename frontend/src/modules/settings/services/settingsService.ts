import apiClient from "@/lib/api";

import type {
  AutoMatchingSettings,
  BloodRequestRulesSettings,
  DonorEligibilitySettings,
  EmergencyAlertSettings,
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  PaginatedAuditLogs,
  SecuritySettings,
  SettingsSection,
  UserRoleSettings,
} from "../types/settings.types";

const basePath = "/system-settings";

export const settingsService = {
  getGeneral: () => apiClient.get<GeneralSettings>(`${basePath}/general/`),
  updateGeneral: (payload: Partial<GeneralSettings>) =>
    apiClient.put<GeneralSettings>(`${basePath}/general/`, payload),

  getUserRoles: () => apiClient.get<UserRoleSettings>(`${basePath}/user-roles/`),
  updateUserRoles: (payload: Partial<UserRoleSettings>) =>
    apiClient.put<UserRoleSettings>(`${basePath}/user-roles/`, payload),

  getNotifications: () => apiClient.get<NotificationSettings>(`${basePath}/notifications/`),
  updateNotifications: (payload: Partial<NotificationSettings>) =>
    apiClient.put<NotificationSettings>(`${basePath}/notifications/`, payload),

  testEmail: (recipient?: string) =>
    apiClient.post<{ detail: string }>(`${basePath}/notifications/test-email/`, { recipient }),
  testSms: (recipient?: string) =>
    apiClient.post<{ detail: string }>(`${basePath}/notifications/test-sms/`, { recipient }),

  getEmergencyAlerts: () =>
    apiClient.get<EmergencyAlertSettings>(`${basePath}/emergency-alerts/`),
  updateEmergencyAlerts: (payload: Partial<EmergencyAlertSettings>) =>
    apiClient.put<EmergencyAlertSettings>(`${basePath}/emergency-alerts/`, payload),

  getBloodRequestRules: () =>
    apiClient.get<BloodRequestRulesSettings>(`${basePath}/blood-request-rules/`),
  updateBloodRequestRules: (payload: Partial<BloodRequestRulesSettings>) =>
    apiClient.put<BloodRequestRulesSettings>(`${basePath}/blood-request-rules/`, payload),

  getDonorEligibility: () =>
    apiClient.get<DonorEligibilitySettings>(`${basePath}/donor-eligibility/`),
  updateDonorEligibility: (payload: Partial<DonorEligibilitySettings>) =>
    apiClient.put<DonorEligibilitySettings>(`${basePath}/donor-eligibility/`, payload),

  getAutoMatching: () => apiClient.get<AutoMatchingSettings>(`${basePath}/auto-matching/`),
  updateAutoMatching: (payload: Partial<AutoMatchingSettings>) =>
    apiClient.put<AutoMatchingSettings>(`${basePath}/auto-matching/`, payload),

  getLocalization: () => apiClient.get<LocalizationSettings>(`${basePath}/localization/`),
  updateLocalization: (payload: Partial<LocalizationSettings>) =>
    apiClient.put<LocalizationSettings>(`${basePath}/localization/`, payload),

  getSecurity: () => apiClient.get<SecuritySettings>(`${basePath}/security/`),
  updateSecurity: (payload: Partial<SecuritySettings>) =>
    apiClient.put<SecuritySettings>(`${basePath}/security/`, payload),

  getAuditLogs: (section?: SettingsSection) =>
    apiClient.get<PaginatedAuditLogs>(`${basePath}/audit-logs/`, {
      params: section ? { section } : undefined,
    }),

  resetSection: (section: SettingsSection) =>
    apiClient.post(`${basePath}/reset-section/`, { section }),
};
