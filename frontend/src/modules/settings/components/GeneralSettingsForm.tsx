import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Switch } from "@components/ui";
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
    control,
    handleSubmit,
    formState: { isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
