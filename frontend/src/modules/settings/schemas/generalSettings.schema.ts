import { z } from "zod";

export const generalSettingsSchema = z.object({
  maintenance_mode: z.boolean(),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
