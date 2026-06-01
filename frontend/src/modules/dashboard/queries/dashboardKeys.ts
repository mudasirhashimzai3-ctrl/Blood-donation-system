import type { DonorCandidateQueryParams } from "../types/dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  activeRequests: () => [...dashboardKeys.all, "activeRequests"] as const,
  donorCandidates: (params?: DonorCandidateQueryParams) =>
    [...dashboardKeys.all, "donorCandidates", params] as const,
};
