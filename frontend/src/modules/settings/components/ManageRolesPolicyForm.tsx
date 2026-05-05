import { Controller, type UseFormReturn } from "react-hook-form";

import { Switch } from "@components/ui";
import type { UserRolePolicyFormValues } from "../schemas/userRolePolicy.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface ManageRolesPolicyFormProps {
  form: UseFormReturn<UserRolePolicyFormValues>;
  onSubmit: (values: UserRolePolicyFormValues) => void | Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
  onCancel?: () => void;
}

export default function ManageRolesPolicyForm({
  form,
  onSubmit,
  loading = false,
  readOnly = false,
  onCancel,
}: ManageRolesPolicyFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="allow_user_invite"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Allow user invitations"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="allow_role_editing"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Allow role editing"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="allow_self_profile_edit"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Allow users to edit their own profiles"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="enforce_2fa_for_admin"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Enforce 2FA for administrators"
            disabled={readOnly}
          />
        )}
      />

      <SettingsSaveBar
        onCancel={onCancel}
        loading={loading}
        readOnly={readOnly}
        disabled={!isDirty}
      />
    </form>
  );
}
