import { z } from "zod";

export const bloodRequestRulesSchema = z.object({
  max_units_per_request: z.coerce.number().int().min(1).max(20),
  require_medical_report: z.boolean(),
  auto_expire_hours: z.coerce.number().int().min(1).max(336),
  allow_duplicate_active_request: z.boolean(),
  verification_required_for_critical: z.boolean(),
});

export type BloodRequestRulesFormValues = z.infer<typeof bloodRequestRulesSchema>;
