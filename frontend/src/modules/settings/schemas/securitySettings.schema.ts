import { z } from "zod";

export const securitySettingsSchema = z.object({
  password_min_length: z.coerce.number().int().min(8).max(128),
  password_require_uppercase: z.boolean(),
  password_require_number: z.boolean(),
  password_require_special_char: z.boolean(),
  password_expiry_days: z.coerce.number().int().min(0).max(3650),
  max_login_attempts: z.coerce.number().int().min(3).max(20),
  lockout_minutes: z.coerce.number().int().min(1).max(1440),
  session_timeout_minutes: z.coerce.number().int().min(5).max(1440),
  force_logout_on_password_change: z.boolean(),
});

export type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;
