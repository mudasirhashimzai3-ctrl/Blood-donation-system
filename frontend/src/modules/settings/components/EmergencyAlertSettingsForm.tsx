import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Switch, Textarea } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useEmergencyAlertSettings, useUpdateEmergencyAlertSettings } from "../queries/useEmergencyAlertSettings";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  emergencyAlertSettingsSchema,
  type EmergencyAlertSettingsFormValues,
} from "../schemas/emergencyAlertSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function EmergencyAlertSettingsForm() {
  const { data, isLoading } = useEmergencyAlertSettings();
  const updateMutation = useUpdateEmergencyAlertSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EmergencyAlertSettingsFormValues>({
    resolver: zodResolver(emergencyAlertSettingsSchema),
    defaultValues: {
      emergency_mode_enabled: true,
      escalation_levels: ["critical", "urgent", "normal"],
      auto_notify_nearby_donors: true,
      donor_radius_km: 30,
      hospital_broadcast_enabled: true,
      alert_throttle_minutes: 15,
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const levels = watch("escalation_levels");

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  return (
    <SettingsSectionCard
      title="Emergency Alert Settings"
      subtitle="Configure escalation, radius and emergency broadcast behavior"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Switch label="Emergency mode enabled" {...register("emergency_mode_enabled")} />
          <Switch label="Auto notify nearby donors" {...register("auto_notify_nearby_donors")} />
          <Switch label="Hospital broadcast enabled" {...register("hospital_broadcast_enabled")} />
          <Input
            label="Donor radius (km)"
            type="number"
            {...register("donor_radius_km", { valueAsNumber: true })}
            error={errors.donor_radius_km?.message}
          />
          <Input
            label="Alert throttle (minutes)"
            type="number"
            {...register("alert_throttle_minutes", { valueAsNumber: true })}
            error={errors.alert_throttle_minutes?.message}
          />
        </div>

        <Textarea
          label="Escalation levels"
          value={levels.join(", ")}
          onChange={(event) => {
            const parsed = event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            setValue("escalation_levels", parsed, { shouldDirty: true, shouldValidate: true });
          }}
          hint="Comma separated values, e.g. critical, urgent, normal"
        />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("emergency_alerts")}
          onViewAudit={() => openAuditDrawer("emergency_alerts")}
        />
      </form>
    </SettingsSectionCard>
  );
}
