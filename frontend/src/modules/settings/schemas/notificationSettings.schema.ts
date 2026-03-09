import { z } from "zod";

export const notificationSettingsSchema = z.object({
  email_enabled: z.boolean(),
  smtp_host: z.string().trim(),
  smtp_port: z.coerce.number().int().min(1).max(65535),
  smtp_username: z.string().trim(),
  smtp_password: z.string().optional().or(z.literal("")),
  from_email: z.string().trim().email("Valid sender email is required"),
  sms_enabled: z.boolean(),
  sms_account_sid: z.string().optional().or(z.literal("")),
  sms_auth_token: z.string().optional().or(z.literal("")),
  sms_from_number: z.string().trim().optional().or(z.literal("")),
  in_app_enabled: z.boolean(),
  notification_retention_days: z.coerce.number().int().min(1).max(3650),
});

export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
