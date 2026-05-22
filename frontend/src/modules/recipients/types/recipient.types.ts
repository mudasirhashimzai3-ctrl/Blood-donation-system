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

export const EMERGENCY_LEVEL_OPTIONS = ["normal", "urgent", "critical"] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];
export type EmergencyLevel = (typeof EMERGENCY_LEVEL_OPTIONS)[number];

export interface Recipient {
  id: number;
  full_name: string;
  email: string | null;
  phone: string;
  required_blood_group: BloodGroup | null;
  hospital: number | null;
  hospital_name: string | null;
  hospital_phone: string | null;
  hospital_email: string | null;
  hospital_address: string | null;
  province: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  emergency_level: EmergencyLevel;
  created_at: string;
  updated_at: string;
}

export type RecipientListItem = Pick<
  Recipient,
  | "id"
  | "full_name"
  | "phone"
  | "required_blood_group"
  | "hospital_name"
  | "emergency_level"
  | "city"
  | "created_at"
>;

export interface RecipientPayload {
  full_name: string;
  email?: string | null;
  phone: string;
  required_blood_group: BloodGroup;
  hospital: number;
  emergency_level: EmergencyLevel;
}

export interface RecipientQueryParams {
  page?: number;
  page_size?: number;
  required_blood_group?: BloodGroup | "";
  emergency_level?: EmergencyLevel | "";
  city?: string;
  ordering?: string;
}

export interface PaginatedRecipients {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecipientListItem[];
}
