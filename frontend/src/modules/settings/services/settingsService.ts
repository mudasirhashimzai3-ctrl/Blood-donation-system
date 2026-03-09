import apiClient from "@/lib/api";

import type {
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  SecuritySettings,
} from "../types/settings.types";
import type {
  PaginatedSettingAuditLogs,
  SettingsOverviewResponse,
  TestEmailPayload,
  TestSmsPayload,
} from "../types/settings-api.types";

export const settingsService = {
  getOverview: () => apiClient.get<SettingsOverviewResponse>("/core/settings/overview/"),

  getGeneral: () => apiClient.get<GeneralSettings>("/core/settings/general/"),
  updateGeneral: (payload: Partial<GeneralSettings>) =>
    apiClient.put<GeneralSettings>("/core/settings/general/", payload),

  getNotifications: () => apiClient.get<NotificationSettings>("/core/settings/notifications/"),
  updateNotifications: (payload: Partial<NotificationSettings>) =>
    apiClient.put<NotificationSettings>("/core/settings/notifications/", payload),
  testEmail: (payload?: TestEmailPayload) =>
    apiClient.post<{ detail: string }>("/core/settings/notifications/test-email/", payload ?? {}),
  testSms: (payload?: TestSmsPayload) =>
    apiClient.post<{ detail: string; sid?: string; status?: string }>(
      "/core/settings/notifications/test-sms/",
      payload ?? {}
    ),

  getLocalization: () => apiClient.get<LocalizationSettings>("/core/settings/localization/"),
  updateLocalization: (payload: Partial<LocalizationSettings>) =>
    apiClient.put<LocalizationSettings>("/core/settings/localization/", payload),

  getSecurity: () => apiClient.get<SecuritySettings>("/core/settings/security/"),
  updateSecurity: (payload: Partial<SecuritySettings>) =>
    apiClient.put<SecuritySettings>("/core/settings/security/", payload),

  getScaffoldSection: (endpoint: string) =>
    apiClient.get(`/core/settings/${endpoint}/`),

  getAuditLogs: (params?: {
    section?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get<PaginatedSettingAuditLogs>("/core/settings/audit-logs/", { params }),
};

export default settingsService;
