import type { GeneralSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useGeneralSettings = () =>
  useSettingsSectionQuery("general", () => settingsService.getGeneral().then((res) => res.data));

export const useUpdateGeneralSettings = () =>
  useSettingsSectionMutation(
    "general",
    (payload: Partial<GeneralSettings>) => settingsService.updateGeneral(payload).then((res) => res.data),
    "General settings saved"
  );
