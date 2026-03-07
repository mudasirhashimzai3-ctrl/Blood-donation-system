import { z } from "zod";

import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_PRIORITY_OPTIONS,
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "../types/notification.types";

export const notificationFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(NOTIFICATION_STATUS_OPTIONS).or(z.literal("")),
  type: z.enum(NOTIFICATION_TYPE_OPTIONS).or(z.literal("")),
  sent_via: z.enum(NOTIFICATION_CHANNEL_OPTIONS).or(z.literal("")),
  priority: z.enum(NOTIFICATION_PRIORITY_OPTIONS).or(z.literal("")),
});

export const notificationReadSchema = z.object({
  is_read: z.boolean(),
});

export type NotificationFilterValues = z.infer<typeof notificationFilterSchema>;
