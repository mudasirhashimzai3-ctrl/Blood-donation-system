import { z } from "zod";

import { DONATION_REMINDER_CHANNELS, DONATION_STATUS_OPTIONS } from "../types/donation.types";

export const donationFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(DONATION_STATUS_OPTIONS).or(z.literal("")),
});

export const donationStatusUpdateSchema = z
  .object({
    status: z.enum(DONATION_STATUS_OPTIONS),
    notes: z.string().optional().nullable(),
    cancellation_reason: z.string().optional().nullable(),
  })
  .refine(
    (value) => value.status !== "cancelled" || !!(value.cancellation_reason && value.cancellation_reason.trim()),
    {
      message: "Cancellation reason is required for cancelled status",
      path: ["cancellation_reason"],
    }
  );

export const donationReminderSchema = z.object({
  channels: z.array(z.enum(DONATION_REMINDER_CHANNELS)).optional(),
});

export type DonationStatusUpdateValues = z.infer<typeof donationStatusUpdateSchema>;
export type DonationReminderValues = z.infer<typeof donationReminderSchema>;
