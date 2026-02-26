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

export const RECIPIENT_STATUS_OPTIONS = ["pending", "active", "blocked"] as const;
export const EMERGENCY_LEVEL_OPTIONS = ["normal", "urgent", "critical"] as const;
export const GENDER_OPTIONS = ["male", "female", "other"] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];
export type RecipientStatus = (typeof RECIPIENT_STATUS_OPTIONS)[number];
export type EmergencyLevel = (typeof EMERGENCY_LEVEL_OPTIONS)[number];
export type Gender = (typeof GENDER_OPTIONS)[number];

export interface Recipient {
  id: number;
  full_name: string;
  email: string | null;
  phone: string;
  required_blood_group: BloodGroup;
  age: number;
  gender: Gender;
  hospital: number;
  hospital_name: string;
  hospital_phone: string | null;
  hospital_email: string | null;
  hospital_address: string | null;
  city: string;
  latitude: string | null;
  longitude: string | null;
  hospital_is_active: boolean;
  emergency_level: EmergencyLevel;
  status: RecipientStatus;
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
  | "status"
  | "created_at"
>;

export interface RecipientPayload {
  full_name: string;
  email?: string | null;
  phone: string;
  required_blood_group: BloodGroup;
  age: number;
  gender: Gender;
  hospital: number;
  emergency_level: EmergencyLevel;
  status: RecipientStatus;
}

export interface RecipientQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  required_blood_group?: BloodGroup | "";
  emergency_level?: EmergencyLevel | "";
  city?: string;
  status?: RecipientStatus | "";
  ordering?: string;
}

export interface PaginatedRecipients {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecipientListItem[];
}
