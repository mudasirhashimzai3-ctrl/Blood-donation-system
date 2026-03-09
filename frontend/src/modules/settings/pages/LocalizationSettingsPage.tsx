import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import LocalizationSettingsForm from "../components/LocalizationSettingsForm";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import {
  useLocalizationSettings,
  useUpdateLocalizationSettings,
} from "../queries/useSettingsQueries";
import {
  localizationSettingsSchema,
  type LocalizationSettingsFormValues,
} from "../schemas/localizationSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

const defaultValues: LocalizationSettingsFormValues = {
  default_language: "en",
  supported_languages: ["en", "da", "pa"],
  default_timezone: "UTC",
  date_format: "yyyy-MM-dd",
  time_format_24h: true,
  first_day_of_week: "monday",
};

export default function LocalizationSettingsPage() {
  const { canViewSettings, canEdit } = useSettingsSectionAccess();
  const markSaved = useSettingsUiStore((state) => state.markSaved);

  const query = useLocalizationSettings();
  const mutation = useUpdateLocalizationSettings();

  const form = useForm<LocalizationSettingsFormValues>({
    resolver: zodResolver(localizationSettingsSchema),
    defaultValues,
  });

  useSettingsDirtyGuard("localization", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const onSubmit = async (values: LocalizationSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    markSaved("localization");
  };

  if (!canViewSettings) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          You do not have permission to access settings.
        </CardContent>
      </Card>
    );
  }

  if (query.isLoading && !query.data) {
    return (
      <Card>
        <CardContent>Loading localization settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Language & Timezone Settings"
        subtitle="Manage localization defaults for the application"
      />
      <SettingsSectionNav />
      {!canEdit ? <ReadOnlyBanner /> : null}
      <Card>
        <CardContent>
          <LocalizationSettingsForm
            form={form}
            onSubmit={onSubmit}
            loading={mutation.isPending}
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
