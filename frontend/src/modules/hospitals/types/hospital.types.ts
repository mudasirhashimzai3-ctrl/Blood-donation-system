export const AFGHANISTAN_PROVINCES = [
  "Badakhshan",
  "Badghis",
  "Baghlan",
  "Balkh",
  "Bamyan",
  "Daykundi",
  "Farah",
  "Faryab",
  "Ghazni",
  "Ghor",
  "Helmand",
  "Herat",
  "Jowzjan",
  "Kabul",
  "Kandahar",
  "Kapisa",
  "Khost",
  "Kunar",
  "Kunduz",
  "Laghman",
  "Logar",
  "Nangarhar",
  "Nimroz",
  "Nuristan",
  "Paktia",
  "Paktika",
  "Panjshir",
  "Parwan",
  "Samangan",
  "Sar-e Pol",
  "Takhar",
  "Urozgan",
  "Wardak",
  "Zabul",
] as const;

export type Province = (typeof AFGHANISTAN_PROVINCES)[number];

export interface Hospital {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: Province;
  city: string;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
}

export interface HospitalListItem {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  province: Province;
  city: string;
  created_at: string;
}

export interface HospitalPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  province: Province;
  city?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface HospitalQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  province?: Province;
  city?: string;
  ordering?: string;
}

export interface PaginatedHospitals {
  count: number;
  next: string | null;
  previous: string | null;
  results: HospitalListItem[];
}
