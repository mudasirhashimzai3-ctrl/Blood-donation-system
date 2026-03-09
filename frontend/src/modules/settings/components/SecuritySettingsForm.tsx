import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input, Switch } from "@components/ui";
import type { SecuritySettingsFormValues } from "../schemas/securitySettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface SecuritySettingsFormProps {
  form: UseFormReturn<SecuritySettingsFormValues>;
  onSubmit: (values: SecuritySettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

export default function SecuritySettingsForm({
  form,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false,
}: SecuritySettingsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Password Minimum Length"
          type="number"
          disabled={readOnly}
          error={errors.password_min_length?.message}
          {...register("password_min_length")}
        />
        <Input
          label="Max Login Attempts"
          type="number"
          disabled={readOnly}
          error={errors.max_login_attempts?.message}
          {...register("max_login_attempts")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Lockout Minutes"
          type="number"
          disabled={readOnly}
          error={errors.lockout_minutes?.message}
          {...register("lockout_minutes")}
        />
        <Input
          label="Session Timeout Minutes"
          type="number"
          disabled={readOnly}
          error={errors.session_timeout_minutes?.message}
          {...register("session_timeout_minutes")}
        />
      </div>

      <Controller
        name="password_require_uppercase"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Require uppercase characters"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="password_require_number"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Require numeric characters"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="password_require_special_char"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Require special characters"
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="force_logout_on_password_change"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Force logout on password change"
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
