import type { DonorEligibilitySettings } from "../types/settings.types";
import { settingsService } from "../services/settingsService";
import { useSettingsSectionMutation, useSettingsSectionQuery } from "../hooks/useSettingsSection";

export const useDonorEligibilityRules = () =>
  useSettingsSectionQuery("donor_eligibility", () =>
    settingsService.getDonorEligibility().then((res) => res.data)
  );

export const useUpdateDonorEligibilityRules = () =>
  useSettingsSectionMutation(
    "donor_eligibility",
    (payload: Partial<DonorEligibilitySettings>) =>
      settingsService.updateDonorEligibility(payload).then((res) => res.data),
    "Donor eligibility rules saved"
  );
