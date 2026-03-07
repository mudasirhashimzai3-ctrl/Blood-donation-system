import type { LocalizationSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useLocalizationSettings = () =>
  useSettingsSectionQuery("localization", () => settingsService.getLocalization().then((res) => res.data));

export const useUpdateLocalizationSettings = () =>
  useSettingsSectionMutation(
    "localization",
    (payload: Partial<LocalizationSettings>) =>
      settingsService.updateLocalization(payload).then((res) => res.data),
    "Localization settings saved"
  );
