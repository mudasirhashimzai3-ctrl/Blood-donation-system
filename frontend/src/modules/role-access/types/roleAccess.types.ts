import type { BloodRequestListItem } from "@/modules/blood-requests/types/bloodRequest.types";

export interface DonorDashboardResponse {
  profile: Record<string, unknown>;
  nearby_requests: BloodRequestListItem[];
  emergency_requests: BloodRequestListItem[];
  history_count: number;
  unread_notifications: number;
}

export interface RecipientDashboardResponse {
  profile: Record<string, unknown>;
  active_requests: BloodRequestListItem[];
  emergency_requests: BloodRequestListItem[];
  unread_notifications: number;
}

export interface RecipientDonorResponseItem {
  notification_id: number;
  donor_id: number;
  donor_name: string;
  donor_phone: string;
  channel: string;
  delivery_status: string;
  response_status: string;
  responded_at: string | null;
  distance_km: string;
  donation_status: string | null;
  donation_id: number | null;
}

export interface RecipientDonorResponseGroup {
  request: BloodRequestListItem;
  responses: RecipientDonorResponseItem[];
}
