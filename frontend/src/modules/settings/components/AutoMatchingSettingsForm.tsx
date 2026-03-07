import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useAutoMatchingSettings, useUpdateAutoMatchingSettings } from "../queries/useAutoMatchingSettings";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  autoMatchingSettingsSchema,
  type AutoMatchingSettingsFormValues,
} from "../schemas/autoMatchingSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function AutoMatchingSettingsForm() {
  const { data, isLoading } = useAutoMatchingSettings();
  const updateMutation = useUpdateAutoMatchingSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AutoMatchingSettingsFormValues>({
    resolver: zodResolver(autoMatchingSettingsSchema),
    defaultValues: {
      enabled: true,
      max_distance_km: 30,
      prioritize_rare_blood_groups: true,
      prioritize_recently_active_donors: true,
      max_candidates_to_notify: 50,
      retry_interval_minutes: 30,
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
    <SettingsSectionCard title="Auto Matching Settings" subtitle="Configure matching radius and candidate strategy">
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Switch label="Auto matching enabled" {...register("enabled")} />
        <Switch label="Prioritize rare blood groups" {...register("prioritize_rare_blood_groups")} />
        <Switch
          label="Prioritize recently active donors"
          {...register("prioritize_recently_active_donors")}
        />

        <Input
          label="Max distance (km)"
          type="number"
          {...register("max_distance_km", { valueAsNumber: true })}
          error={errors.max_distance_km?.message}
        />
        <Input
          label="Max candidates to notify"
          type="number"
          {...register("max_candidates_to_notify", { valueAsNumber: true })}
          error={errors.max_candidates_to_notify?.message}
        />
        <Input
          label="Retry interval (minutes)"
          type="number"
          {...register("retry_interval_minutes", { valueAsNumber: true })}
          error={errors.retry_interval_minutes?.message}
        />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("auto_matching")}
          onViewAudit={() => openAuditDrawer("auto_matching")}
        />
      </form>
    </SettingsSectionCard>
  );
}
