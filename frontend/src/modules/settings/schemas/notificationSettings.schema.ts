import { z } from "zod";

export const notificationSettingsSchema = z.object({
  email_enabled: z.boolean(),
  email_provider: z.enum(["smtp", "sendgrid", "ses", "custom"]),
  smtp_host: z.string(),
  smtp_port: z.coerce.number().int().min(1).max(65535),
  smtp_username: z.string(),
  smtp_password: z.string().optional().nullable(),
  sms_enabled: z.boolean(),
  sms_provider: z.enum(["twilio", "vonage", "custom"]),
  sms_sender_id: z.string(),
  sms_auth_token: z.string().optional().nullable(),
  in_app_enabled: z.boolean(),
  notification_retention_days: z.coerce.number().int().min(1).max(3650),
});

export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
