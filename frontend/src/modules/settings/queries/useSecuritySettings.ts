import type { SecuritySettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useSecuritySettings = () =>
  useSettingsSectionQuery("security", () => settingsService.getSecurity().then((res) => res.data));

export const useUpdateSecuritySettings = () =>
  useSettingsSectionMutation(
    "security",
    (payload: Partial<SecuritySettings>) => settingsService.updateSecurity(payload).then((res) => res.data),
    "Security settings saved"
  );
