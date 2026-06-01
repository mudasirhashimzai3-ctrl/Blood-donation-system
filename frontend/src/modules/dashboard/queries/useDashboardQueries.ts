import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../services/dashboardService";
import type { DonorCandidateQueryParams } from "../types/dashboard.types";
import { dashboardKeys } from "./dashboardKeys";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary().then((res) => res.data),
  });

export const useDashboardActiveRequests = () =>
  useQuery({
    queryKey: dashboardKeys.activeRequests(),
    queryFn: () => dashboardService.getActiveBloodRequests().then((res) => res.data),
  });

export const useDashboardDonorCandidates = (
  params: DonorCandidateQueryParams,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: dashboardKeys.donorCandidates(params),
    queryFn: () => dashboardService.getDonorCandidates(params).then((res) => res.data),
    enabled: options?.enabled ?? Boolean(params.blood_request_id),
  });
