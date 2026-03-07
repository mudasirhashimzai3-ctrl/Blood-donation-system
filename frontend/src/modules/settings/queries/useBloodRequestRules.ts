import type { BloodRequestRulesSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useBloodRequestRules = () =>
  useSettingsSectionQuery("blood_request_rules", () =>
    settingsService.getBloodRequestRules().then((res) => res.data)
  );

export const useUpdateBloodRequestRules = () =>
  useSettingsSectionMutation(
    "blood_request_rules",
    (payload: Partial<BloodRequestRulesSettings>) =>
      settingsService.updateBloodRequestRules(payload).then((res) => res.data),
    "Blood request rules saved"
  );
