export const NOTIFICATION_CHANNEL_OPTIONS = ["in_app", "email", "sms"] as const;
export const NOTIFICATION_STATUS_OPTIONS = ["queued", "sent", "delivered", "failed"] as const;
export const NOTIFICATION_PRIORITY_OPTIONS = ["low", "normal", "high", "critical"] as const;
export const NOTIFICATION_TYPE_OPTIONS = [
  "request_update",
  "donation_update",
  "auth",
  "system",
  "reminder",
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNEL_OPTIONS)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUS_OPTIONS)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITY_OPTIONS)[number];
export type NotificationType = (typeof NOTIFICATION_TYPE_OPTIONS)[number];

export interface Notification {
  id: number;
  user_id: number;
  user_type: string;
  request_id: number | null;
  donation_id: number | null;
  event_key: string;
  type: NotificationType;
  title: string;
  message: string;
  sent_via: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  is_read: boolean;
  read_at: string | null;
  sent_at: string | null;
  metadata: Record<string, unknown>;
  dedupe_key: string | null;
  error_message: string | null;
  provider_message_id: string | null;
  provider_status: string | null;
  provider_response: Record<string, unknown> | null;
  delivery_attempts: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationListItem = Pick<
  Notification,
  | "id"
  | "request_id"
  | "donation_id"
  | "event_key"
  | "type"
  | "title"
  | "message"
  | "sent_via"
  | "status"
  | "priority"
  | "is_read"
  | "read_at"
  | "sent_at"
  | "created_at"
  | "updated_at"
>;

export interface NotificationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_read?: boolean;
  status?: NotificationStatus | "";
  type?: NotificationType | "";
  sent_via?: NotificationChannel | "";
  priority?: NotificationPriority | "";
  event_key?: string;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationListItem[];
}

export interface UnreadCountResponse {
  count: number;
}
