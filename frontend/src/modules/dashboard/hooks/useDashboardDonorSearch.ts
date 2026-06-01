import { useEffect, useMemo } from "react";

import type { BloodGroup } from "@/modules/blood-requests/types/bloodRequest.types";
import { useDashboardUiStore } from "../stores/useDashboardUiStore";
import type { DashboardBloodRequestOption, DonorSearchRadius } from "../types/dashboard.types";

export const useDashboardDonorSearch = (requests: DashboardBloodRequestOption[]) => {
  const {
    bloodRequestId,
    bloodGroup,
    radiusKm,
    page,
    pageSize,
    setBloodRequestId,
    setBloodGroup,
    setRadiusKm,
    setPage,
    setPageSize,
    reset,
  } = useDashboardUiStore();

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === bloodRequestId) ?? null,
    [bloodRequestId, requests]
  );

  useEffect(() => {
    if ((!bloodRequestId || !selectedRequest) && requests.length > 0) {
      const firstRequest = requests[0];
      setBloodRequestId(firstRequest.id);
      setBloodGroup(firstRequest.blood_group);
    }
  }, [bloodRequestId, requests, selectedRequest, setBloodGroup, setBloodRequestId]);

  useEffect(() => {
    if (selectedRequest && !bloodGroup) {
      setBloodGroup(selectedRequest.blood_group);
    }
  }, [bloodGroup, selectedRequest, setBloodGroup]);

  const queryParams = useMemo(
    () => ({
      blood_request_id: bloodRequestId ?? undefined,
      blood_group: bloodGroup || selectedRequest?.blood_group,
      radius_km: radiusKm,
      page,
      page_size: pageSize,
    }),
    [bloodGroup, bloodRequestId, page, pageSize, radiusKm, selectedRequest?.blood_group]
  );

  const selectBloodRequest = (nextId: number | null) => {
    const request = requests.find((item) => item.id === nextId);
    setBloodRequestId(nextId);
    setBloodGroup((request?.blood_group ?? "") as BloodGroup | "");
  };

  return {
    bloodRequestId,
    bloodGroup,
    radiusKm,
    page,
    pageSize,
    selectedRequest,
    setBloodRequestId: selectBloodRequest,
    setBloodGroup,
    setRadiusKm: (value: DonorSearchRadius) => setRadiusKm(value),
    setPage,
    setPageSize,
    reset,
    queryParams,
  };
};
