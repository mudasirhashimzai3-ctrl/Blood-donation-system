import { z } from "zod";

const numericCoordinate = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
    }, `${label} must be between ${min} and ${max}`);

export const hospitalFormSchema = z.object({
  name: z.string().trim().min(2, "Hospital name must be at least 2 characters"),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Email is invalid",
    }),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  latitude: numericCoordinate("Latitude", -90, 90),
  longitude: numericCoordinate("Longitude", -180, 180),
  is_active: z.boolean(),
});

export type HospitalFormValues = z.infer<typeof hospitalFormSchema>;
