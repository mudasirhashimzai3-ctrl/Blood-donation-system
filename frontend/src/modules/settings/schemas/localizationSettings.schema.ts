import { z } from "zod";

export const localizationSettingsSchema = z.object({
  default_language: z.enum(["en", "da", "pa", "ar", "fr", "de", "es"]),
  supported_languages: z.array(z.enum(["en", "da", "pa", "ar", "fr", "de", "es"])).min(1),
  default_timezone: z.string().min(1),
  date_format: z.enum(["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]),
  time_format_24h: z.boolean(),
  first_day_of_week: z.enum(["monday", "sunday", "saturday"]),
});

export type LocalizationSettingsFormValues = z.infer<typeof localizationSettingsSchema>;
