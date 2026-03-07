import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type { NotificationSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useNotificationSettings = () =>
  useSettingsSectionQuery("notifications", () => settingsService.getNotifications().then((res) => res.data));

export const useUpdateNotificationSettings = () =>
  useSettingsSectionMutation(
    "notifications",
    (payload: Partial<NotificationSettings>) =>
      settingsService.updateNotifications(payload).then((res) => res.data),
    "Notification settings saved"
  );

export const useTestEmailSettings = () =>
  useMutation({
    mutationFn: (recipient?: string) => settingsService.testEmail(recipient).then((res) => res.data),
    onSuccess: (data) => toast.success(data.detail),
    onError: (error) => toast.error(extractAxiosError(error, "Failed to send test email")),
  });

export const useTestSmsSettings = () =>
  useMutation({
    mutationFn: (recipient?: string) => settingsService.testSms(recipient).then((res) => res.data),
    onSuccess: (data) => toast.success(data.detail),
    onError: (error) => toast.error(extractAxiosError(error, "Failed to send test SMS")),
  });
