import { z } from "zod";

export const donorEligibilityRulesSchema = z
  .object({
    min_age: z.coerce.number().int().min(18).max(100),
    max_age: z.coerce.number().int().min(18).max(120),
    min_weight_kg: z.coerce.number().min(30).max(250),
    min_gap_days_between_donations: z.coerce.number().int().min(1).max(365),
    hemoglobin_min: z.coerce.number().min(1).max(25),
    block_if_recent_infection_days: z.coerce.number().int().min(0).max(365),
  })
  .refine((data) => data.max_age >= data.min_age, {
    path: ["max_age"],
    message: "max_age must be greater than or equal to min_age",
  });

export type DonorEligibilityRulesFormValues = z.infer<typeof donorEligibilityRulesSchema>;
