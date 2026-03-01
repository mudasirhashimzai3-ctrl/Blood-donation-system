import { z } from "zod";

import { BLOOD_GROUP_OPTIONS, DONOR_STATUS_OPTIONS } from "../types/donor.types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const notFutureDate = (value?: string) => {
  if (!value) return true;
  const selectedDate = new Date(value);
  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return selectedDate <= today;
};

export const donorFormSchema = z.object({
  first_name: z.string().trim().min(2, "First name must be at least 2 characters"),
  last_name: z.string().trim().min(2, "Last name must be at least 2 characters"),
  phone: z.string().trim().min(6, "Phone must be at least 6 characters"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Email is invalid",
    }),
  blood_group: z.enum(BLOOD_GROUP_OPTIONS),
  status: z.enum(DONOR_STATUS_OPTIONS),
  profile_picture: z
    .any()
    .nullable()
    .optional()
    .refine((file) => !file || typeof File === "undefined" || file instanceof File, {
      message: "Profile picture is invalid",
    })
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "Profile picture must be an image file",
    })
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, {
      message: "Profile picture size must be 5MB or less",
    }),
  remove_profile_picture: z.boolean(),
  date_of_birth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => notFutureDate(value || undefined), {
      message: "Date of birth cannot be in the future",
    }),
  address: z.string().optional().or(z.literal("")),
  emergency_contact_name: z.string().optional().or(z.literal("")),
  emergency_contact_phone: z.string().optional().or(z.literal("")),
  last_donation_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => notFutureDate(value || undefined), {
      message: "Last donation date cannot be in the future",
    }),
  latitude: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -90 && parsed <= 90;
    }, "Latitude must be between -90 and 90"),
  longitude: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= -180 && parsed <= 180;
    }, "Longitude must be between -180 and 180"),
  notes: z.string().optional().or(z.literal("")),
});

export type DonorFormValues = z.infer<typeof donorFormSchema>;
