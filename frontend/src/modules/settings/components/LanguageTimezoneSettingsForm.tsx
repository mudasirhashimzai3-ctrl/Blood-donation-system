import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Select, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { useLocalizationSettings, useUpdateLocalizationSettings } from "../queries/useLocalizationSettings";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  localizationSettingsSchema,
  type LocalizationSettingsFormValues,
} from "../schemas/localizationSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "da", label: "Dari" },
  { value: "pa", label: "Pashto" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
];

export default function LanguageTimezoneSettingsForm() {
  const { data, isLoading } = useLocalizationSettings();
  const updateMutation = useUpdateLocalizationSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<LocalizationSettingsFormValues>({
    resolver: zodResolver(localizationSettingsSchema),
    defaultValues: {
      default_language: "en",
      supported_languages: ["en", "da", "pa"],
      default_timezone: "UTC",
      date_format: "YYYY-MM-DD",
      time_format_24h: true,
      first_day_of_week: "monday",
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const supportedLanguages = watch("supported_languages");

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  return (
    <SettingsSectionCard
      title="Language & Timezone Settings"
      subtitle="Set default language, timezone and display formats"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Default language" options={LANGUAGE_OPTIONS} {...register("default_language")} />
          <Input
            label="Supported languages"
            value={supportedLanguages.join(",")}
            onChange={(event) => {
              const parsed = event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter((item): item is LocalizationSettingsFormValues["default_language"] =>
                  LANGUAGE_OPTIONS.some((option) => option.value === item)
                );
              setValue("supported_languages", parsed, { shouldDirty: true, shouldValidate: true });
            }}
            hint="Comma separated language codes (en,da,pa,...)"
            error={errors.supported_languages?.message?.toString()}
          />
          <Input
            label="Default timezone"
            {...register("default_timezone")}
            error={errors.default_timezone?.message}
          />
          <Select
            label="Date format"
            options={[
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            ]}
            {...register("date_format")}
          />
          <Select
            label="First day of week"
            options={[
              { value: "monday", label: "Monday" },
              { value: "sunday", label: "Sunday" },
              { value: "saturday", label: "Saturday" },
            ]}
            {...register("first_day_of_week")}
          />
          <Switch label="Use 24h time format" {...register("time_format_24h")} />
        </div>

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("localization")}
          onViewAudit={() => openAuditDrawer("localization")}
        />
      </form>
    </SettingsSectionCard>
  );
}
