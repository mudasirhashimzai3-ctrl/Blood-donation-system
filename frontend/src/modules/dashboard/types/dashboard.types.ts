import type { BloodGroup, BloodRequestListItem } from "@/modules/blood-requests/types/bloodRequest.types";

export const DONOR_SEARCH_RADIUS_OPTIONS = [ 10, 20, 50, 100] as const;

export type DonorSearchRadius = (typeof DONOR_SEARCH_RADIUS_OPTIONS)[number];
export type DonorMatchType = "exact" | "compatible";
export type DonorEligibilityStatus = "eligible" | "not_eligible";

export interface DashboardSummary {
  totals: {
    donors: number;
    recipients: number;
    active_requests: number;
    completed_donations: number;
  };
  blood_group_distribution: Array<{
    blood_group: BloodGroup;
    count: number;
  }>;
  request_status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  generated_at: string;
}

export interface DonorCandidate {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  blood_group: BloodGroup;
  status: "active";
  last_donation_date: string | null;
  distance_km: string;
  match_type: DonorMatchType;
  is_eligible: boolean;
  eligibility_status: DonorEligibilityStatus;
  eligible_from: string | null;
  eligibility_reason: string;
}

export interface DonorCandidateQueryParams {
  blood_request_id?: number;
  blood_group?: BloodGroup | "";
  radius_km?: DonorSearchRadius;
  page?: number;
  page_size?: number;
}

export interface PaginatedDonorCandidates {
  count: number;
  next: string | null;
  previous: string | null;
  results: DonorCandidate[];
}

export type DashboardBloodRequestOption = BloodRequestListItem;
