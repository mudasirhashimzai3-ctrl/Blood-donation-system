import { z } from "zod";

import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  RECIPIENT_STATUS_OPTIONS,
} from "../types/recipient.types";

export const recipientFormSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Email is invalid",
    }),
  phone: z.string().trim().min(6, "Phone must be at least 6 characters"),
  required_blood_group: z.enum(BLOOD_GROUP_OPTIONS),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be 120 or less"),
  gender: z.enum(GENDER_OPTIONS),
  hospital: z.coerce.number().int().positive("Hospital is required"),
  emergency_level: z.enum(EMERGENCY_LEVEL_OPTIONS),
  status: z.enum(RECIPIENT_STATUS_OPTIONS),
});

export type RecipientFormValues = z.infer<typeof recipientFormSchema>;

