import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { settingsService } from "../services/settingsService";
import type {
  AutoMatchingSettings,
  BackupScheduleSettings,
  ChangePasswordPayload,
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  RolePermissionMatrixPayload,
  SecuritySettings,
  SettingsSection,
  UserRoleSettings,
} from "../types/settings.types";
import { settingsKeys } from "./settingsKeys";

export const useSettingsOverview = () =>
  useQuery({
    queryKey: settingsKeys.overview(),
    queryFn: () => settingsService.getOverview().then((res) => res.data),
  });

export const useGeneralSettings = () =>
  useQuery({
    queryKey: settingsKeys.section("general"),
    queryFn: () => settingsService.getGeneral().then((res) => res.data),
  });

export const useNotificationSettings = () =>
  useQuery({
    queryKey: settingsKeys.section("notifications"),
    queryFn: () => settingsService.getNotifications().then((res) => res.data),
  });

export const useLocalizationSettings = () =>
  useQuery({
    queryKey: settingsKeys.section("localization"),
    queryFn: () => settingsService.getLocalization().then((res) => res.data),
  });

export const useSecuritySettings = () =>
  useQuery({
    queryKey: settingsKeys.section("security"),
    queryFn: () => settingsService.getSecurity().then((res) => res.data),
  });

export const useUserRoleSettings = () =>
  useQuery({
    queryKey: settingsKeys.section("user_roles"),
    queryFn: () => settingsService.getUserRoles().then((res) => res.data),
  });

export const useAutoMatchingSettings = () =>
  useQuery({
    queryKey: settingsKeys.section("auto_matching"),
    queryFn: () => settingsService.getAutoMatching().then((res) => res.data),
  });

export const useBackupRestoreOverview = () =>
  useQuery({
    queryKey: settingsKeys.backupRestore(),
    queryFn: () => settingsService.getBackupRestore().then((res) => res.data),
  });

export const useRolePermissionMatrix = () =>
  useQuery({
    queryKey: settingsKeys.rolePermissions(),
    queryFn: () => settingsService.getUserRolePermissions().then((res) => res.data),
  });

export const useScaffoldSettingsSection = (section: SettingsSection, endpoint: string) =>
  useQuery({
    queryKey: settingsKeys.section(section),
    queryFn: () => settingsService.getScaffoldSection(endpoint).then((res) => res.data),
  });

const useInvalidateSettings = () => {
  const queryClient = useQueryClient();
  return (section: SettingsSection) => {
    queryClient.invalidateQueries({ queryKey: settingsKeys.section(section) });
    queryClient.invalidateQueries({ queryKey: settingsKeys.overview() });
  };
};

export const useUpdateGeneralSettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<GeneralSettings>) =>
      settingsService.updateGeneral(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("General settings saved");
      invalidate("general");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save general settings"));
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<NotificationSettings>) =>
      settingsService.updateNotifications(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Notification settings saved");
      invalidate("notifications");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save notification settings"));
    },
  });
};

export const useTestNotificationEmail = () =>
  useMutation({
    mutationFn: (payload?: { test_to?: string }) =>
      settingsService.testEmail(payload).then((res) => res.data),
    onSuccess: (data) => {
      toast.success(data.detail || "Test email sent");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to send test email"));
    },
  });

export const useTestNotificationSms = () =>
  useMutation({
    mutationFn: (payload?: { phone?: string }) =>
      settingsService.testSms(payload).then((res) => res.data),
    onSuccess: (data) => {
      toast.success(data.detail || "Test SMS sent");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to send test SMS"));
    },
  });

export const useUpdateLocalizationSettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<LocalizationSettings>) =>
      settingsService.updateLocalization(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Localization settings saved");
      invalidate("localization");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save localization settings"));
    },
  });
};

export const useUpdateSecuritySettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<SecuritySettings>) =>
      settingsService.updateSecurity(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Security settings saved");
      invalidate("security");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save security settings"));
    },
  });
};

export const useUpdateUserRoleSettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<UserRoleSettings>) =>
      settingsService.updateUserRoles(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Role policy settings saved");
      invalidate("user_roles");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save role policy settings"));
    },
  });
};

export const useUpdateAutoMatchingSettings = () => {
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<AutoMatchingSettings>) =>
      settingsService.updateAutoMatching(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Auto matching settings saved");
      invalidate("auto_matching");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save auto matching settings"));
    },
  });
};

export const useUpdateBackupRestoreSettings = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: Partial<BackupScheduleSettings>) =>
      settingsService.updateBackupRestore(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Backup schedule saved");
      queryClient.invalidateQueries({ queryKey: settingsKeys.backupRestore() });
      invalidate("backup_restore");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save backup schedule"));
    },
  });
};

export const useCreateManualBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.createManualBackup().then((res) => res.data),
    onSuccess: () => {
      toast.success("Backup completed");
      queryClient.invalidateQueries({ queryKey: settingsKeys.backupRestore() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create backup"));
    },
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => settingsService.restoreBackup(id).then((res) => res.data),
    onSuccess: () => {
      toast.success("Backup restored");
      queryClient.invalidateQueries({ queryKey: settingsKeys.backupRestore() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to restore backup"));
    },
  });
};

export const useDownloadBackup = () =>
  useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename: string }) => {
      const response = await settingsService.downloadBackup(id);
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to download backup"));
    },
  });

export const useUpdateRolePermissionMatrix = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSettings();

  return useMutation({
    mutationFn: (payload: RolePermissionMatrixPayload) =>
      settingsService.updateUserRolePermissions(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Role permission matrix saved");
      queryClient.invalidateQueries({ queryKey: settingsKeys.rolePermissions() });
      invalidate("user_roles");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to save role permission matrix"));
    },
  });
};

export const useChangeMyPassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      settingsService.changeMyPassword(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to change password"));
    },
  });

export const useSettingsAuditLogs = (params?: {
  section?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}) =>
  useQuery({
    queryKey: settingsKeys.auditList(params),
    queryFn: () => settingsService.getAuditLogs(params).then((res) => res.data),
  });
