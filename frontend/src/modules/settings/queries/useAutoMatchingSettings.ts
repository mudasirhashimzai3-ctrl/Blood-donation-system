import type { AutoMatchingSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useAutoMatchingSettings = () =>
  useSettingsSectionQuery("auto_matching", () => settingsService.getAutoMatching().then((res) => res.data));

export const useUpdateAutoMatchingSettings = () =>
  useSettingsSectionMutation(
    "auto_matching",
    (payload: Partial<AutoMatchingSettings>) =>
      settingsService.updateAutoMatching(payload).then((res) => res.data),
    "Auto matching settings saved"
  );
