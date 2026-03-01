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

export const DONOR_STATUS_OPTIONS = ["active", "blocked", "pending"] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];
export type DonorStatus = (typeof DONOR_STATUS_OPTIONS)[number];

export interface Donor {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  blood_group: BloodGroup;
  status: DonorStatus;
  profile_picture: string | null;
  profile_picture_url: string | null;
  latitude: string | null;
  longitude: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  last_donation_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DonorListItem = Pick<
  Donor,
  | "id"
  | "first_name"
  | "last_name"
  | "phone"
  | "email"
  | "blood_group"
  | "status"
  | "last_donation_date"
  | "profile_picture_url"
  | "created_at"
>;

export interface DonorPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  blood_group: BloodGroup;
  status: DonorStatus;
  profile_picture?: File | null;
  remove_profile_picture?: boolean;
  latitude?: string | null;
  longitude?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  last_donation_date?: string | null;
  notes?: string | null;
}

export interface DonorQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  blood_group?: BloodGroup | "";
  status?: DonorStatus | "";
  ordering?: string;
}

export interface PaginatedDonors {
  count: number;
  next: string | null;
  previous: string | null;
  results: DonorListItem[];
}
