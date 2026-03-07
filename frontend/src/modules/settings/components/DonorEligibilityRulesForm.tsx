import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import {
  useDonorEligibilityRules,
  useUpdateDonorEligibilityRules,
} from "../queries/useDonorEligibilityRules";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  donorEligibilityRulesSchema,
  type DonorEligibilityRulesFormValues,
} from "../schemas/donorEligibilityRules.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function DonorEligibilityRulesForm() {
  const { data, isLoading } = useDonorEligibilityRules();
  const updateMutation = useUpdateDonorEligibilityRules();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DonorEligibilityRulesFormValues>({
    resolver: zodResolver(donorEligibilityRulesSchema),
    defaultValues: {
      min_age: 18,
      max_age: 60,
      min_weight_kg: 50,
      min_gap_days_between_donations: 56,
      hemoglobin_min: 12.5,
      block_if_recent_infection_days: 14,
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  return (
    <SettingsSectionCard
      title="Donor Eligibility Rules"
      subtitle="Set age, weight and health thresholds for donation"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input label="Min age" type="number" {...register("min_age", { valueAsNumber: true })} error={errors.min_age?.message} />
        <Input label="Max age" type="number" {...register("max_age", { valueAsNumber: true })} error={errors.max_age?.message} />
        <Input
          label="Min weight (kg)"
          type="number"
          {...register("min_weight_kg", { valueAsNumber: true })}
          error={errors.min_weight_kg?.message}
        />
        <Input
          label="Min gap days between donations"
          type="number"
          {...register("min_gap_days_between_donations", { valueAsNumber: true })}
          error={errors.min_gap_days_between_donations?.message}
        />
        <Input
          label="Min hemoglobin"
          type="number"
          {...register("hemoglobin_min", { valueAsNumber: true })}
          error={errors.hemoglobin_min?.message}
        />
        <Input
          label="Block recent infection days"
          type="number"
          {...register("block_if_recent_infection_days", { valueAsNumber: true })}
          error={errors.block_if_recent_infection_days?.message}
        />

        <div className="md:col-span-2">
          <SettingsSaveBar
            isDirty={isDirty}
            isSaving={updateMutation.isPending || resetMutation.isPending}
            onSave={() => void onSubmit()}
            onReset={() => void resetMutation.mutateAsync("donor_eligibility")}
            onViewAudit={() => openAuditDrawer("donor_eligibility")}
          />
        </div>
      </form>
    </SettingsSectionCard>
  );
}
