import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BloodGroup } from "@/modules/blood-requests/types/bloodRequest.types";
import type { DonorSearchRadius } from "../types/dashboard.types";

interface DashboardUiState {
  bloodRequestId: number | null;
  bloodGroup: BloodGroup | "";
  radiusKm: DonorSearchRadius;
  page: number;
  pageSize: number;
  setBloodRequestId: (bloodRequestId: number | null) => void;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setRadiusKm: (radiusKm: DonorSearchRadius) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export const useDashboardUiStore = create<DashboardUiState>()(
  persist(
    (set) => ({
      bloodRequestId: null,
      bloodGroup: "",
      radiusKm: 10,
      page: 1,
      pageSize: 10,
      setBloodRequestId: (bloodRequestId) => set({ bloodRequestId, page: 1 }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setRadiusKm: (radiusKm) => set({ radiusKm, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      reset: () => set({ bloodRequestId: null, bloodGroup: "", radiusKm: 10, page: 1 }),
    }),
    {
      name: "admin-dashboard-ui-state",
      partialize: (state) => ({
        radiusKm: state.radiusKm,
        pageSize: state.pageSize,
      }),
    }
  )
);
