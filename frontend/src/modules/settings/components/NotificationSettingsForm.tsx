import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, Select, Switch } from "@/components/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import TestChannelButtons from "./TestChannelButtons";
import { useNotificationSettings, useUpdateNotificationSettings } from "../queries/useNotificationSettings";
import { useResetSettingsSection } from "../queries/useSettingsAuditLogs";
import {
  notificationSettingsSchema,
  type NotificationSettingsFormValues,
} from "../schemas/notificationSettings.schema";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function NotificationSettingsForm() {
  const { data, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();
  const resetMutation = useResetSettingsSection();
  const openAuditDrawer = useSettingsUiStore((state) => state.openAuditDrawer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_enabled: true,
      email_provider: "smtp",
      smtp_host: "",
      smtp_port: 587,
      smtp_username: "",
      smtp_password: "",
      sms_enabled: false,
      sms_provider: "twilio",
      sms_sender_id: "",
      sms_auth_token: "",
      in_app_enabled: true,
      notification_retention_days: 90,
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  return (
    <SettingsSectionCard
      title="Notification Settings"
      subtitle="Configure Email, SMS and in-app notification channels"
    >
      {isLoading ? <p className="text-sm text-text-secondary">Loading...</p> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Switch label="Email enabled" {...register("email_enabled")} />
          <Switch label="SMS enabled" {...register("sms_enabled")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Email Provider"
            options={[
              { value: "smtp", label: "SMTP" },
              { value: "sendgrid", label: "SendGrid" },
              { value: "ses", label: "Amazon SES" },
              { value: "custom", label: "Custom" },
            ]}
            {...register("email_provider")}
          />
          <Select
            label="SMS Provider"
            options={[
              { value: "twilio", label: "Twilio" },
              { value: "vonage", label: "Vonage" },
              { value: "custom", label: "Custom" },
            ]}
            {...register("sms_provider")}
          />
          <Input label="SMTP Host" {...register("smtp_host")} error={errors.smtp_host?.message} />
          <Input
            label="SMTP Port"
            type="number"
            {...register("smtp_port", { valueAsNumber: true })}
            error={errors.smtp_port?.message}
          />
          <Input label="SMTP Username" {...register("smtp_username")} error={errors.smtp_username?.message} />
          <Input
            label="SMTP Password"
            type="password"
            {...register("smtp_password")}
            error={errors.smtp_password?.message}
          />
          <Input label="SMS Sender ID" {...register("sms_sender_id")} error={errors.sms_sender_id?.message} />
          <Input
            label="SMS Auth Token"
            type="password"
            {...register("sms_auth_token")}
            error={errors.sms_auth_token?.message}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Switch label="In-app notifications enabled" {...register("in_app_enabled")} />
          <Input
            label="Retention days"
            type="number"
            {...register("notification_retention_days", { valueAsNumber: true })}
            error={errors.notification_retention_days?.message}
          />
        </div>

        <TestChannelButtons />

        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={updateMutation.isPending || resetMutation.isPending}
          onSave={() => void onSubmit()}
          onReset={() => void resetMutation.mutateAsync("notifications")}
          onViewAudit={() => openAuditDrawer("notifications")}
        />
      </form>
    </SettingsSectionCard>
  );
}
