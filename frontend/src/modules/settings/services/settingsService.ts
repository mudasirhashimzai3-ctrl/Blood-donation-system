import apiClient from "@/lib/api";

import type {
  AutoMatchingSettings,
  ChangePasswordPayload,
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  RolePermissionMatrixPayload,
  SecuritySettings,
  UserRoleSettings,
} from "../types/settings.types";
import type {
  PaginatedSettingAuditLogs,
  RolePermissionMatrixResponse,
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

  getUserRoles: () => apiClient.get<UserRoleSettings>("/core/settings/user-roles/"),
  updateUserRoles: (payload: Partial<UserRoleSettings>) =>
    apiClient.put<UserRoleSettings>("/core/settings/user-roles/", payload),

  getAutoMatching: () => apiClient.get<AutoMatchingSettings>("/core/settings/auto-matching/"),
  updateAutoMatching: (payload: Partial<AutoMatchingSettings>) =>
    apiClient.put<AutoMatchingSettings>("/core/settings/auto-matching/", payload),

  getUserRolePermissions: () =>
    apiClient.get<RolePermissionMatrixResponse>("/core/settings/user-roles/permissions/"),
  updateUserRolePermissions: (payload: RolePermissionMatrixPayload) =>
    apiClient.put<RolePermissionMatrixResponse>("/core/settings/user-roles/permissions/", payload),

  changeMyPassword: (payload: ChangePasswordPayload) =>
    apiClient.post<{ message: string }>("/accounts/auth/change-password/", payload),

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
