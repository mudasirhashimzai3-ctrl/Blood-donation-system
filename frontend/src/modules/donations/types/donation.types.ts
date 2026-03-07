export const DONATION_STATUS_OPTIONS = [
  "pending",
  "accepted",
  "en_route",
  "arrived",
  "completed",
  "cancelled",
  "declined",
  "expired",
] as const;

export const DONATION_REMINDER_CHANNELS = ["in_app", "email", "sms"] as const;

export type DonationStatus = (typeof DONATION_STATUS_OPTIONS)[number];
export type DonationReminderChannel = (typeof DONATION_REMINDER_CHANNELS)[number];

export interface Donation {
  id: number;
  request: number;
  donor: number;
  donor_name: string;
  donor_phone: string;
  status: DonationStatus;
  response_time: number | null;
  distance_km: string;
  estimated_arrival_time: number | null;
  is_primary: boolean;
  notified_at: string | null;
  reminder_sent_at: string | null;
  priority_score: string;
  request_status: string;
  request_response_deadline: string | null;
  nearby_donors_count_dynamic: number;
  estimated_time_dynamic: number | null;
  distance_dynamic: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  responded_at: string | null;
  reminder_count: number;
  request_blood_group: string;
  request_priority: string;
  request_type: string;
  recipient_name: string;
  hospital_name: string;
  created_at: string;
  updated_at: string;
}

export type DonationListItem = Pick<
  Donation,
  | "id"
  | "request"
  | "donor"
  | "donor_name"
  | "donor_phone"
  | "status"
  | "response_time"
  | "distance_km"
  | "estimated_arrival_time"
  | "is_primary"
  | "notified_at"
  | "reminder_sent_at"
  | "priority_score"
  | "request_status"
  | "request_response_deadline"
  | "nearby_donors_count_dynamic"
  | "estimated_time_dynamic"
  | "distance_dynamic"
  | "created_at"
  | "updated_at"
>;

export interface DonationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: DonationStatus | "";
  request?: number;
  donor?: number;
  is_primary?: boolean;
  ordering?: string;
}

export interface PaginatedDonations {
  count: number;
  next: string | null;
  previous: string | null;
  results: DonationListItem[];
}

export interface DonationStatusPayload {
  status: DonationStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
}

export interface DonationReminderPayload {
  channels?: DonationReminderChannel[];
}

export interface DonationReminderResult {
  donation_id: number;
  sent_channels: DonationReminderChannel[];
  failed_channels: Array<{ channel: DonationReminderChannel; error: string }>;
  reminder_count: number;
}
