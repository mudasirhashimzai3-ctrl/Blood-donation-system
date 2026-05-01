import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BloodGroup } from "../types/donor.types";

interface DonorUiState {
  bloodGroup: BloodGroup | "";
  page: number;
  pageSize: number;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useDonorUiStore = create<DonorUiState>()(
  persist(
    (set) => ({
      bloodGroup: "",
      page: 1,
      pageSize: 10,
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ bloodGroup: "", page: 1 }),
    }),
    {
      name: "donor-ui-state",
      partialize: (state) => ({
        bloodGroup: state.bloodGroup,
        pageSize: state.pageSize,
      }),
    }
  )
);
