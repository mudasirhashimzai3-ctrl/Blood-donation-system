import apiClient from "@/lib/api";
import type { PaginatedBloodRequests } from "@/modules/blood-requests/types/bloodRequest.types";
import type {
  DashboardSummary,
  DonorCandidateQueryParams,
  PaginatedDonorCandidates,
} from "../types/dashboard.types";

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummary>("/core/dashboard/summary/"),

  getActiveBloodRequests: () =>
    apiClient.get<PaginatedBloodRequests>("/blood-requests/active-options/", {
      params: {
        page_size: 100,
      },
    }),

  getDonorCandidates: (params: DonorCandidateQueryParams) =>
    apiClient.get<PaginatedDonorCandidates>("/donors/candidates/", { params }),
};

export default dashboardService;
