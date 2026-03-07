import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useBloodRequestRules, useUpdateBloodRequestRules } from "../queries/useBloodRequestRules";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  bloodRequestRulesSchema,
  type BloodRequestRulesFormValues,
} from "../schemas/bloodRequestRules.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function BloodRequestRulesForm() {
  const { data, isLoading } = useBloodRequestRules();
  const updateMutation = useUpdateBloodRequestRules();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BloodRequestRulesFormValues>({
    resolver: zodResolver(bloodRequestRulesSchema),
    defaultValues: {
      max_units_per_request: 8,
      require_medical_report: true,
      auto_expire_hours: 24,
      allow_duplicate_active_request: false,
      verification_required_for_critical: true,
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
      title="Blood Request Rules"
      subtitle="Control request validation and expiry policies"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Max units per request"
          type="number"
          {...register("max_units_per_request", { valueAsNumber: true })}
          error={errors.max_units_per_request?.message}
        />
        <Input
          label="Auto expire (hours)"
          type="number"
          {...register("auto_expire_hours", { valueAsNumber: true })}
          error={errors.auto_expire_hours?.message}
        />
        <Switch label="Require medical report" {...register("require_medical_report")} />
        <Switch
          label="Allow duplicate active request"
          {...register("allow_duplicate_active_request")}
        />
        <Switch
          label="Critical requests require verification"
          {...register("verification_required_for_critical")}
        />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("blood_request_rules")}
          onViewAudit={() => openAuditDrawer("blood_request_rules")}
        />
      </form>
    </SettingsSectionCard>
  );
}
