import { z } from "zod";

export const generalSettingsSchema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required"),
  support_email: z.string().trim().email("Valid support email is required"),
  support_phone: z.string().trim().min(6, "Support phone must be at least 6 characters"),
  address: z.string().trim().min(1, "Address is required"),
  logo_url: z.string().trim().optional().or(z.literal("")),
  maintenance_mode: z.boolean(),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
