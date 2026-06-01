import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useDashboardDonorSearch } from "@/modules/dashboard/hooks/useDashboardDonorSearch";
import { useDashboardUiStore } from "@/modules/dashboard/stores/useDashboardUiStore";
import type { DashboardBloodRequestOption } from "@/modules/dashboard/types/dashboard.types";

const requests: DashboardBloodRequestOption[] = [
  {
    id: 7,
    recipient: 1,
    recipient_name: "Recipient One",
    hospital: 2,
    hospital_name: "City Hospital",
    blood_group: "A+",
    units_needed: 2,
    request_type: "urgent",
    status: "pending",
    is_verified: true,
    is_emergency: true,
    response_deadline: null,
    nearby_donors_count: 0,
    total_notified_donors: 0,
    assigned_donor: null,
    assigned_donor_name: null,
    created_at: "2026-01-01T00:00:00Z",
  },
];

describe("useDashboardDonorSearch", () => {
  afterEach(() => {
    act(() => {
      useDashboardUiStore.setState({
        bloodRequestId: null,
        bloodGroup: "",
        radiusKm: 10,
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("defaults to the first active request and maps query params", async () => {
    const { result } = renderHook(() => useDashboardDonorSearch(requests));

    await waitFor(() => {
      expect(result.current.bloodRequestId).toBe(7);
    });

    expect(result.current.queryParams).toEqual({
      blood_request_id: 7,
      blood_group: "A+",
      radius_km: 10,
      page: 1,
      page_size: 10,
    });
  });

  it("updates radius and pagination for donor search", () => {
    act(() => {
      useDashboardUiStore.setState({
        bloodRequestId: 7,
        bloodGroup: "A+",
        radiusKm: 20,
        page: 3,
        pageSize: 25,
      });
    });

    const { result } = renderHook(() => useDashboardDonorSearch(requests));

    expect(result.current.queryParams).toMatchObject({
      blood_request_id: 7,
      blood_group: "A+",
      radius_km: 20,
      page: 3,
      page_size: 25,
    });
  });
});
