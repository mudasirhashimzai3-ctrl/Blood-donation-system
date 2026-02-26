export interface Hospital {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HospitalListItem {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
}

export interface HospitalPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city: string;
  latitude?: string | null;
  longitude?: string | null;
  is_active?: boolean;
}

export interface HospitalQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  city?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface PaginatedHospitals {
  count: number;
  next: string | null;
  previous: string | null;
  results: HospitalListItem[];
}

