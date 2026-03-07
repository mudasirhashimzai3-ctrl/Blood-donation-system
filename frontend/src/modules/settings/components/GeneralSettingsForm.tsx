import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useGeneralSettings, useUpdateGeneralSettings } from "../queries/useGeneralSettings";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import { generalSettingsSchema, type GeneralSettingsFormValues } from "../schemas/generalSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function GeneralSettingsForm() {
  const { data, isLoading } = useGeneralSettings();
  const updateMutation = useUpdateGeneralSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      organization_name: "",
      support_email: "",
      support_phone: "",
      address: "",
      logo_url: "",
      default_country: "",
      maintenance_mode: false,
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
      title="General Settings"
      subtitle="Organization profile, support channels and maintenance controls"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Organization Name" {...register("organization_name")} error={errors.organization_name?.message} />
        <Input label="Support Email" type="email" {...register("support_email")} error={errors.support_email?.message} />
        <Input label="Support Phone" {...register("support_phone")} error={errors.support_phone?.message} />
        <Input label="Address" {...register("address")} error={errors.address?.message} />
        <Input label="Logo URL" {...register("logo_url")} error={errors.logo_url?.message} />
        <Input label="Default Country" {...register("default_country")} error={errors.default_country?.message} />
        <Switch label="Maintenance Mode" {...register("maintenance_mode")} />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("general")}
          onViewAudit={() => openAuditDrawer("general")}
        />
      </form>
    </SettingsSectionCard>
  );
}
