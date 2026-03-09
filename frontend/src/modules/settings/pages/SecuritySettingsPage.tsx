import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import { useSessionStore } from "@/modules/auth/stores/useSessionStore";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import SecuritySettingsForm from "../components/SecuritySettingsForm";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import {
  useSecuritySettings,
  useUpdateSecuritySettings,
} from "../queries/useSettingsQueries";
import {
  securitySettingsSchema,
  type SecuritySettingsFormValues,
} from "../schemas/securitySettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

const defaultValues: SecuritySettingsFormValues = {
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_number: true,
  password_require_special_char: false,
  max_login_attempts: 5,
  lockout_minutes: 30,
  session_timeout_minutes: 30,
  force_logout_on_password_change: true,
};

export default function SecuritySettingsPage() {
  const { canViewSettings, canEdit } = useSettingsSectionAccess();
  const setSessionTimeoutMinutes = useSessionStore((state) => state.setSessionTimeoutMinutes);
  const markSaved = useSettingsUiStore((state) => state.markSaved);

  const query = useSecuritySettings();
  const mutation = useUpdateSecuritySettings();

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues,
  });

  useSettingsDirtyGuard("security", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const onSubmit = async (values: SecuritySettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset(updated);
    setSessionTimeoutMinutes(updated.session_timeout_minutes);
    markSaved("security");
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
        <CardContent>Loading security settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Settings"
        subtitle="Control password policy, lockout and session behavior"
      />
      <SettingsSectionNav />
      {!canEdit ? <ReadOnlyBanner /> : null}
      <Card>
        <CardContent>
          <SecuritySettingsForm
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
