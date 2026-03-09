import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox, Input, Select, Switch } from "@components/ui";
import type { LocalizationSettingsFormValues } from "../schemas/localizationSettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface LocalizationSettingsFormProps {
  form: UseFormReturn<LocalizationSettingsFormValues>;
  onSubmit: (values: LocalizationSettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "da", label: "Dari" },
  { value: "pa", label: "Pashto" },
] as const;

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
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const selectedLanguages = watch("supported_languages");

  const toggleLanguage = (code: "en" | "da" | "pa", checked: boolean) => {
    const current = new Set(selectedLanguages);
    if (checked) current.add(code);
    else current.delete(code);
    setValue("supported_languages", Array.from(current) as Array<"en" | "da" | "pa">, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Default Language"
          disabled={readOnly}
          error={errors.default_language?.message}
          options={languageOptions.map((item) => ({ value: item.value, label: item.label }))}
          {...register("default_language")}
        />
        <Input
          label="Default Timezone"
          disabled={readOnly}
          error={errors.default_timezone?.message}
          {...register("default_timezone")}
        />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-2 text-sm font-medium text-text-primary">Supported Languages</p>
        <div className="grid gap-2 md:grid-cols-3">
          {languageOptions.map((language) => (
            <Checkbox
              key={language.value}
              disabled={readOnly}
              label={language.label}
              checked={selectedLanguages.includes(language.value)}
              onChange={(event) => toggleLanguage(language.value, event.target.checked)}
            />
          ))}
        </div>
        {errors.supported_languages?.message ? (
          <p className="mt-2 text-sm text-error">{errors.supported_languages.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Date Format"
          disabled={readOnly}
          error={errors.date_format?.message}
          {...register("date_format")}
        />
        <Select
          label="First Day of Week"
          disabled={readOnly}
          error={errors.first_day_of_week?.message}
          options={weekOptions}
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
            label="Use 24-hour Time Format"
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
