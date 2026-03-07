import type { UserRoleSettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useUserRoleSettings = () =>
  useSettingsSectionQuery("user_roles", () => settingsService.getUserRoles().then((res) => res.data));

export const useUpdateUserRoleSettings = () =>
  useSettingsSectionMutation(
    "user_roles",
    (payload: Partial<UserRoleSettings>) => settingsService.updateUserRoles(payload).then((res) => res.data),
    "User role settings saved"
  );
