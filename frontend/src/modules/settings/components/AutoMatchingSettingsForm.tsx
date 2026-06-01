import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input, Select, Switch } from "@components/ui";
import {
  NOTIFICATION_RADIUS_OPTIONS,
  type AutoMatchingSettingsFormValues,
} from "../schemas/autoMatchingSettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface AutoMatchingSettingsFormProps {
  form: UseFormReturn<AutoMatchingSettingsFormValues>;
  onSubmit: (values: AutoMatchingSettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

export default function AutoMatchingSettingsForm({
  form,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false,
}: AutoMatchingSettingsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 rounded-lg border border-border p-4">
        <Controller
          name="enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Enable Automatic Donor Matching"
              disabled={readOnly}
            />
          )}
        />

        <Controller
          name="max_distance_km"
          control={control}
          render={({ field }) => (
            <Select
              label="Donor Notification Radius"
              value={String(field.value)}
              onChange={(event) => field.onChange(Number(event.target.value))}
              disabled={readOnly}
              error={errors.max_distance_km?.message}
              options={NOTIFICATION_RADIUS_OPTIONS.map((distance) => ({
                value: String(distance),
                label: `${distance} KM`,
              }))}
              hint="Blood request notifications are sent only to eligible compatible donors inside this radius."
            />
          )}
        />
      </div>

      <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
        <Controller
          name="prioritize_rare_blood_groups"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Prioritize Rare Blood Groups"
              disabled={readOnly}
            />
          )}
        />
        <Controller
          name="prioritize_recently_active_donors"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Prioritize Recently Active Donors"
              disabled={readOnly}
            />
          )}
        />
        <Input
          label="Maximum Candidates to Notify"
          type="number"
          disabled={readOnly}
          error={errors.max_candidates_to_notify?.message}
          {...register("max_candidates_to_notify")}
        />
        <Input
          label="Retry Interval (minutes)"
          type="number"
          disabled={readOnly}
          error={errors.retry_interval_minutes?.message}
          {...register("retry_interval_minutes")}
        />
      </div>

      <SettingsSaveBar
        onCancel={onCancel}
        loading={loading}
        readOnly={readOnly}
        disabled={!isDirty}
      />
    </form>
  );
}
