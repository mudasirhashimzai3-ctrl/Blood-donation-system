import { z } from "zod";

export const emergencyAlertSettingsSchema = z.object({
  emergency_mode_enabled: z.boolean(),
  escalation_levels: z.array(z.string().min(1)).min(1),
  auto_notify_nearby_donors: z.boolean(),
  donor_radius_km: z.coerce.number().min(1).max(500),
  hospital_broadcast_enabled: z.boolean(),
  alert_throttle_minutes: z.coerce.number().int().min(1).max(1440),
});

export type EmergencyAlertSettingsFormValues = z.infer<typeof emergencyAlertSettingsSchema>;
