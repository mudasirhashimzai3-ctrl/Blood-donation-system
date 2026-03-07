import { z } from "zod";

export const autoMatchingSettingsSchema = z.object({
  enabled: z.boolean(),
  max_distance_km: z.coerce.number().min(1).max(1000),
  prioritize_rare_blood_groups: z.boolean(),
  prioritize_recently_active_donors: z.boolean(),
  max_candidates_to_notify: z.coerce.number().int().min(1).max(1000),
  retry_interval_minutes: z.coerce.number().int().min(1).max(10080),
});

export type AutoMatchingSettingsFormValues = z.infer<typeof autoMatchingSettingsSchema>;
