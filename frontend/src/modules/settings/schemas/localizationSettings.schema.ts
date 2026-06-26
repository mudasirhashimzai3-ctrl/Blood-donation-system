import { z } from "zod";

export const localizationSettingsSchema = z.object({
  default_timezone: z.string().trim().min(1, "Timezone is required"),
  date_format: z.string().trim().min(1, "Date format is required"),
  time_format_24h: z.boolean(),
  first_day_of_week: z.enum(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]),
});

export type LocalizationSettingsFormValues = z.infer<typeof localizationSettingsSchema>;
