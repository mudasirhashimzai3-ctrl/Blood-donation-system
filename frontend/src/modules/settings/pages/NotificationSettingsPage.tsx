import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import NotificationSettingsForm from "../components/NotificationSettingsForm";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsDirtyGuard } from "../hooks/useSettingsDirtyGuard";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import {
  useNotificationSettings,
  useTestNotificationEmail,
  useTestNotificationSms,
  useUpdateNotificationSettings,
} from "../queries/useSettingsQueries";
import {
  notificationSettingsSchema,
  type NotificationSettingsFormValues,
} from "../schemas/notificationSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

const defaultValues: NotificationSettingsFormValues = {
  email_enabled: true,
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  from_email: "",
  sms_enabled: false,
  sms_account_sid: "",
  sms_auth_token: "",
  sms_from_number: "",
  in_app_enabled: true,
  notification_retention_days: 30,
};

export default function NotificationSettingsPage() {
  const { canViewSettings, canEdit } = useSettingsSectionAccess();
  const markSaved = useSettingsUiStore((state) => state.markSaved);

  const query = useNotificationSettings();
  const mutation = useUpdateNotificationSettings();
  const testEmailMutation = useTestNotificationEmail();
  const testSmsMutation = useTestNotificationSms();

  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues,
  });

  useSettingsDirtyGuard("notifications", form.formState.isDirty);

  useEffect(() => {
    if (query.data) {
      form.reset({
        email_enabled: query.data.email_enabled,
        smtp_host: query.data.smtp_host,
        smtp_port: query.data.smtp_port,
        smtp_username: query.data.smtp_username,
        smtp_password: "",
        from_email: query.data.from_email,
        sms_enabled: query.data.sms_enabled,
        sms_account_sid: "",
        sms_auth_token: "",
        sms_from_number: query.data.sms_from_number,
        in_app_enabled: query.data.in_app_enabled,
        notification_retention_days: query.data.notification_retention_days,
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: NotificationSettingsFormValues) => {
    if (!canEdit) return;
    const updated = await mutation.mutateAsync(values);
    form.reset({
      ...values,
      ...updated,
      smtp_password: "",
      sms_account_sid: "",
      sms_auth_token: "",
    });
    markSaved("notifications");
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
        <CardContent>Loading notification settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        subtitle="Configure email, SMS and in-app notification channels"
      />
      <SettingsSectionNav />
      {!canEdit ? <ReadOnlyBanner /> : null}
      <Card>
        <CardContent>
          <NotificationSettingsForm
            form={form}
            onSubmit={onSubmit}
            loading={mutation.isPending}
            readOnly={!canEdit}
            smtpPasswordHint={query.data?.smtp_password_masked}
            smsSidHint={query.data?.sms_account_sid_masked}
            smsTokenHint={query.data?.sms_auth_token_masked}
            onTestEmail={() => testEmailMutation.mutate({})}
            onTestSms={() => testSmsMutation.mutate({})}
            testingEmail={testEmailMutation.isPending}
            testingSms={testSmsMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
