import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Button, Input, Switch } from "@components/ui";
import type { NotificationSettingsFormValues } from "../schemas/notificationSettings.schema";
import SettingsSaveBar from "./SettingsSaveBar";

interface NotificationSettingsFormProps {
  form: UseFormReturn<NotificationSettingsFormValues>;
  onSubmit: (values: NotificationSettingsFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  smtpPasswordHint?: string | null;
  smsSidHint?: string | null;
  smsTokenHint?: string | null;
  onTestEmail?: () => void;
  onTestSms?: () => void;
  testingEmail?: boolean;
  testingSms?: boolean;
}

export default function NotificationSettingsForm({
  form,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false,
  smtpPasswordHint,
  smsSidHint,
  smsTokenHint,
  onTestEmail,
  onTestSms,
  testingEmail = false,
  testingSms = false,
}: NotificationSettingsFormProps) {
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
          name="email_enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Enable Email Notifications"
              disabled={readOnly}
            />
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="SMTP Host" disabled={readOnly} error={errors.smtp_host?.message} {...register("smtp_host")} />
          <Input
            label="SMTP Port"
            type="number"
            disabled={readOnly}
            error={errors.smtp_port?.message}
            {...register("smtp_port")}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="SMTP Username"
            disabled={readOnly}
            error={errors.smtp_username?.message}
            {...register("smtp_username")}
          />
          <Input
            label="From Email"
            type="email"
            disabled={readOnly}
            error={errors.from_email?.message}
            {...register("from_email")}
          />
        </div>
        <Input
          label="SMTP Password"
          type="password"
          disabled={readOnly}
          hint={smtpPasswordHint ? `Stored: ${smtpPasswordHint}` : "Leave empty to keep existing"}
          error={errors.smtp_password?.message}
          {...register("smtp_password")}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <Controller
          name="sms_enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Enable SMS Notifications"
              disabled={readOnly}
            />
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="SMS Account SID"
            disabled={readOnly}
            hint={smsSidHint ? `Stored: ${smsSidHint}` : "Leave empty to keep existing"}
            error={errors.sms_account_sid?.message}
            {...register("sms_account_sid")}
          />
          <Input
            label="SMS Auth Token"
            type="password"
            disabled={readOnly}
            hint={smsTokenHint ? `Stored: ${smsTokenHint}` : "Leave empty to keep existing"}
            error={errors.sms_auth_token?.message}
            {...register("sms_auth_token")}
          />
        </div>
        <Input
          label="SMS From Number"
          disabled={readOnly}
          error={errors.sms_from_number?.message}
          {...register("sms_from_number")}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <Controller
          name="in_app_enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              label="Enable In-App Notifications"
              disabled={readOnly}
            />
          )}
        />
        <Input
          label="Notification Retention (days)"
          type="number"
          disabled={readOnly}
          error={errors.notification_retention_days?.message}
          {...register("notification_retention_days")}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onTestEmail} loading={testingEmail} disabled={readOnly}>
          Test Email
        </Button>
        <Button type="button" variant="outline" onClick={onTestSms} loading={testingSms} disabled={readOnly}>
          Test SMS
        </Button>
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
