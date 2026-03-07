import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import { useSecuritySettings, useUpdateSecuritySettings } from "../queries/useSecuritySettings";
import { securitySettingsSchema, type SecuritySettingsFormValues } from "../schemas/securitySettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function SecuritySettingsForm() {
  const { data, isLoading } = useSecuritySettings();
  const updateMutation = useUpdateSecuritySettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_number: true,
      password_require_special_char: false,
      password_expiry_days: 90,
      max_login_attempts: 5,
      lockout_minutes: 30,
      session_timeout_minutes: 30,
      force_logout_on_password_change: true,
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
      title="Security Settings"
      subtitle="Password policy, lockout behavior and session controls"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Password min length"
            type="number"
            {...register("password_min_length", { valueAsNumber: true })}
            error={errors.password_min_length?.message}
          />
          <Input
            label="Password expiry (days)"
            type="number"
            {...register("password_expiry_days", { valueAsNumber: true })}
            error={errors.password_expiry_days?.message}
          />
          <Input
            label="Max login attempts"
            type="number"
            {...register("max_login_attempts", { valueAsNumber: true })}
            error={errors.max_login_attempts?.message}
          />
          <Input
            label="Lockout (minutes)"
            type="number"
            {...register("lockout_minutes", { valueAsNumber: true })}
            error={errors.lockout_minutes?.message}
          />
          <Input
            label="Session timeout (minutes)"
            type="number"
            {...register("session_timeout_minutes", { valueAsNumber: true })}
            error={errors.session_timeout_minutes?.message}
          />
        </div>

        <Switch label="Require uppercase" {...register("password_require_uppercase")} />
        <Switch label="Require numeric" {...register("password_require_number")} />
        <Switch label="Require special character" {...register("password_require_special_char")} />
        <Switch
          label="Force logout on password change"
          {...register("force_logout_on_password_change")}
        />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("security")}
          onViewAudit={() => openAuditDrawer("security")}
        />
      </form>
    </SettingsSectionCard>
  );
}
