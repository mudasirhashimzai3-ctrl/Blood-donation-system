import { z } from "zod";

export const NOTIFICATION_RADIUS_OPTIONS = [10, 20, 50, 100] as const;

export const autoMatchingSettingsSchema = z.object({
  enabled: z.boolean(),
  max_distance_km: z.coerce.number().refine(
    (value) => NOTIFICATION_RADIUS_OPTIONS.includes(value as (typeof NOTIFICATION_RADIUS_OPTIONS)[number]),
    "Notification radius must be 10, 20, 50, or 100 KM"
  ),
  prioritize_rare_blood_groups: z.boolean(),
  prioritize_recently_active_donors: z.boolean(),
  max_candidates_to_notify: z.coerce.number().int().min(1).max(500),
  retry_interval_minutes: z.coerce.number().int().min(1).max(1440),
});

export type AutoMatchingSettingsFormValues = z.infer<typeof autoMatchingSettingsSchema>;
