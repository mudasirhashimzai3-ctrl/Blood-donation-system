import type { EmergencyAlertSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useEmergencyAlertSettings = () =>
  useSettingsSectionQuery("emergency_alerts", () =>
    settingsService.getEmergencyAlerts().then((res) => res.data)
  );

export const useUpdateEmergencyAlertSettings = () =>
  useSettingsSectionMutation(
    "emergency_alerts",
    (payload: Partial<EmergencyAlertSettings>) =>
      settingsService.updateEmergencyAlerts(payload).then((res) => res.data),
    "Emergency alert settings saved"
  );
