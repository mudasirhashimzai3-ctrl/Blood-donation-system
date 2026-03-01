export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const BLOOD_REQUEST_STATUS_OPTIONS = [
  "pending",
  "matched",
  "completed",
  "cancelled",
] as const;

export const REQUEST_TYPE_OPTIONS = ["normal", "urgent", "critical"] as const;
export const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;
export const CANCELLED_BY_OPTIONS = ["admin", "recipient"] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];
export type BloodRequestStatus = (typeof BLOOD_REQUEST_STATUS_OPTIONS)[number];
export type RequestType = (typeof REQUEST_TYPE_OPTIONS)[number];
export type Priority = (typeof PRIORITY_OPTIONS)[number];
export type CancelledBy = (typeof CANCELLED_BY_OPTIONS)[number];

export interface BloodRequestAttachment {
  type: "medical_report" | "prescription_image" | "emergency_proof";
  url: string;
}

export interface BloodRequest {
  id: number;
  recipient: number;
  recipient_name: string;
  recipient_phone: string;
  hospital: number;
  hospital_name: string;
  hospital_city: string;
  blood_group: BloodGroup;
  units_needed: number;
  request_type: RequestType;
  priority: Priority;
  estimated_time_to_fulfill: number | null;
  nearby_donors_count: number;
  total_notified_donors: number;
  assigned_donor: number | null;
  assigned_donor_name: string | null;
  auto_match_enabled: boolean;
  location_lat: string;
  location_lon: string;
  status: BloodRequestStatus;
  is_active: boolean;
  rejection_reason: string | null;
  cancelled_by: CancelledBy | null;
  is_verified: boolean;
  is_emergency: boolean;
  response_deadline: string | null;
  matched_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  medical_report: string | null;
  prescription_image: string | null;
  emergency_proof: string | null;
  medical_report_url: string | null;
  prescription_image_url: string | null;
  emergency_proof_url: string | null;
  attachments: BloodRequestAttachment[];
  created_at: string;
  updated_at: string;
}

export type BloodRequestListItem = Pick<
  BloodRequest,
  | "id"
  | "recipient"
  | "recipient_name"
  | "hospital"
  | "hospital_name"
  | "blood_group"
  | "units_needed"
  | "request_type"
  | "priority"
  | "status"
  | "is_verified"
  | "is_emergency"
  | "response_deadline"
  | "nearby_donors_count"
  | "total_notified_donors"
  | "assigned_donor"
  | "assigned_donor_name"
  | "created_at"
>;

export interface BloodRequestPayload {
  recipient: number;
  hospital: number;
  blood_group: BloodGroup;
  units_needed: number;
  request_type: RequestType;
  priority: Priority;
  auto_match_enabled?: boolean;
  location_lat: string;
  location_lon: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_emergency?: boolean;
  response_deadline?: string | null;
  medical_report?: File | null;
  prescription_image?: File | null;
  emergency_proof?: File | null;
}

export interface BloodRequestQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: BloodRequestStatus | "";
  blood_group?: BloodGroup | "";
  request_type?: RequestType | "";
  priority?: Priority | "";
  is_verified?: boolean;
  is_emergency?: boolean;
  is_active?: boolean;
  hospital?: number;
  recipient?: number;
  assigned_donor?: number;
  ordering?: string;
}

export interface PaginatedBloodRequests {
  count: number;
  next: string | null;
  previous: string | null;
  results: BloodRequestListItem[];
}

export interface BloodRequestNotification {
  id: number;
  donor: number;
  donor_name: string;
  donor_phone: string;
  distance_km: string;
  channel: "in_app" | "sms" | "email";
  delivery_status: "queued" | "sent" | "failed";
  response_status: "pending" | "accepted" | "declined" | "expired";
  queued_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloodRequestCandidate {
  donor_id: number;
  donor_name: string;
  donor_phone: string;
  distance_km: string;
  response_status: BloodRequestNotification["response_status"];
  delivery_status: BloodRequestNotification["delivery_status"];
}
