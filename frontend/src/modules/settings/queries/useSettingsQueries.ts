import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { settingsService } from "../services/settingsService";
import type {
  GeneralSettings,
  LocalizationSettings,
  NotificationSettings,
  SecuritySettings,
  SettingsSection,
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
