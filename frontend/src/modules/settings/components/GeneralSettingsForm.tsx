import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input, Switch, Textarea } from "@components/ui";
import type { GeneralSettingsFormValues } from "../schemas/generalSettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface GeneralSettingsFormProps {
  form: UseFormReturn<GeneralSettingsFormValues>;
  onSubmit: (values: GeneralSettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

export default function GeneralSettingsForm({
  form,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false,
}: GeneralSettingsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Organization Name"
        disabled={readOnly}
        error={errors.organization_name?.message}
        {...register("organization_name")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Support Email"
          type="email"
          disabled={readOnly}
          error={errors.support_email?.message}
          {...register("support_email")}
        />
        <Input
          label="Support Phone"
          disabled={readOnly}
          error={errors.support_phone?.message}
          {...register("support_phone")}
        />
      </div>
      <Textarea
        label="Address"
        rows={3}
        disabled={readOnly}
        error={errors.address?.message}
        {...register("address")}
      />
      <Input
        label="Logo URL"
        disabled={readOnly}
        error={errors.logo_url?.message}
        {...register("logo_url")}
      />

      <Controller
        name="maintenance_mode"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label="Maintenance Mode"
            description="Enable temporary maintenance mode for the system"
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
