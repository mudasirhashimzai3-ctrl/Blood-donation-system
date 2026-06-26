import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import GeneralSettingsForm from "../components/GeneralSettingsForm";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import {
  useGeneralSettings,
  useUpdateGeneralSettings,
} from "../queries/useSettingsQueries";
import {
  generalSettingsSchema,
  type GeneralSettingsFormValues,
} from "../schemas/generalSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

const defaultValues: GeneralSettingsFormValues = {
  maintenance_mode: false,
};

export default function GeneralSettingsPage() {
  const { canViewSettings, canEdit } = useSettingsSectionAccess();
  const markSaved = useSettingsUiStore((state) => state.markSaved);

  const query = useGeneralSettings();
  const mutation = useUpdateGeneralSettings();

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues,
  });

  useSettingsDirtyGuard("general", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset({
        maintenance_mode: query.data.maintenance_mode,
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    markSaved("general");
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
        <CardContent>Loading general settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        subtitle="Configure organization-level system settings"
      />
      <SettingsSectionNav />
      {!canEdit ? <ReadOnlyBanner /> : null}
      <Card>
        <CardContent>
          <GeneralSettingsForm
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
