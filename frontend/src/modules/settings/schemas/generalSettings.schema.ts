import { z } from "zod";

export const generalSettingsSchema = z.object({
  organization_name: z.string().max(200),
  support_email: z.string().email("Invalid support email").or(z.literal("")),
  support_phone: z.string().max(32),
  address: z.string(),
  logo_url: z.string(),
  default_country: z.string().max(100),
  maintenance_mode: z.boolean(),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
