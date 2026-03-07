import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Select, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import { useUpdateUserRoleSettings, useUserRoleSettings } from "../queries/useUserRoleSettings";
import {
  userRoleSettingsSchema,
  type UserRoleSettingsFormValues,
} from "../schemas/userRoleSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function UserRoleSettingsForm() {
  const { data, isLoading } = useUserRoleSettings();
  const updateMutation = useUpdateUserRoleSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UserRoleSettingsFormValues>({
    resolver: zodResolver(userRoleSettingsSchema),
    defaultValues: {
      allow_user_invite: true,
      default_new_user_role: "receptionist",
      allow_role_editing: false,
      allow_self_profile_edit: true,
      enforce_2fa_for_admin: false,
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
      title="User & Role Management"
      subtitle="Configure invitation policy and role controls"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Select
          label="Default Role"
          options={[
            { value: "admin", label: "Admin" },
            { value: "receptionist", label: "Receptionist" },
            { value: "viewer", label: "Viewer" },
          ]}
          {...register("default_new_user_role")}
        />

        <Switch label="Allow user invite" {...register("allow_user_invite")} />
        <Switch label="Allow role editing" {...register("allow_role_editing")} />
        <Switch label="Allow self profile edit" {...register("allow_self_profile_edit")} />
        <Switch label="Enforce 2FA for admin" {...register("enforce_2fa_for_admin")} />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("user_roles")}
          onViewAudit={() => openAuditDrawer("user_roles")}
        />
      </form>
    </SettingsSectionCard>
  );
}
