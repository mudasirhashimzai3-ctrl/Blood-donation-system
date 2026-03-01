import { z } from "zod";

import {
  BLOOD_GROUP_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from "../types/bloodRequest.types";

const validateDateTime = (value?: string) => {
  if (!value) return true;
  return !Number.isNaN(new Date(value).getTime());
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const fileFieldSchema = z
  .any()
  .nullable()
  .optional()
  .refine((file) => !file || typeof File === "undefined" || file instanceof File, {
    message: "Invalid file",
  })
  .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
    message: "File size must be 10MB or less",
  });

export const bloodRequestFormSchema = z.object({
  recipient: z.coerce.number().int().positive("Recipient is required"),
  hospital: z.coerce.number().int().positive("Hospital is required"),
  blood_group: z.enum(BLOOD_GROUP_OPTIONS),
  units_needed: z.coerce.number().int().min(1, "Units needed must be at least 1"),
  request_type: z.enum(REQUEST_TYPE_OPTIONS),
  priority: z.enum(PRIORITY_OPTIONS),
  auto_match_enabled: z.boolean(),
  location_lat: z
    .string()
    .trim()
    .min(1, "Latitude is required")
    .refine((value) => {
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -90 && parsed <= 90;
    }, "Latitude must be between -90 and 90"),
  location_lon: z
    .string()
    .trim()
    .min(1, "Longitude is required")
    .refine((value) => {
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -180 && parsed <= 180;
    }, "Longitude must be between -180 and 180"),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  is_emergency: z.boolean(),
  response_deadline: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => validateDateTime(value || undefined), "Response deadline is invalid"),
  medical_report: fileFieldSchema,
  prescription_image: fileFieldSchema.refine((file) => !file || file.type.startsWith("image/"), {
    message: "Prescription must be an image file",
  }),
  emergency_proof: fileFieldSchema,
});

export type BloodRequestFormValues = z.infer<typeof bloodRequestFormSchema>;
