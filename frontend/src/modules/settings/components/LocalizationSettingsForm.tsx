import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input, Select, Switch } from "@components/ui";
import type { LocalizationSettingsFormValues } from "../schemas/localizationSettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface LocalizationSettingsFormProps {
  form: UseFormReturn<LocalizationSettingsFormValues>;
  onSubmit: (values: LocalizationSettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

const weekOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function LocalizationSettingsForm({
  form,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false,
}: LocalizationSettingsFormProps) {
  const { t } = useTranslation();
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
          label={t("settings.localization.defaultTimezone", "Default Timezone")}
          disabled={readOnly}
          error={errors.default_timezone?.message}
          {...register("default_timezone")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("settings.localization.dateFormat", "Date Format")}
          disabled={readOnly}
          error={errors.date_format?.message}
          {...register("date_format")}
        />
        <Select
          label={t("settings.localization.firstDayOfWeek", "First Day of Week")}
          disabled={readOnly}
          error={errors.first_day_of_week?.message}
          options={weekOptions.map((item) => ({
            value: item.value,
            label: t(`settings.localization.weekdays.${item.value}`, item.label),
          }))}
          {...register("first_day_of_week")}
        />
      </div>

      <Controller
        name="time_format_24h"
        control={control}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            label={t("settings.localization.use24HourTime", "Use 24-hour Time Format")}
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
