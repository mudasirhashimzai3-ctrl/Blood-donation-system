import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BloodGroup, DonorStatus } from "../types/donor.types";

interface DonorUiState {
  search: string;
  bloodGroup: BloodGroup | "";
  status: DonorStatus | "";
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setStatus: (status: DonorStatus | "") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useDonorUiStore = create<DonorUiState>()(
  persist(
    (set) => ({
      search: "",
      bloodGroup: "",
      status: "",
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ search: "", bloodGroup: "", status: "", page: 1 }),
    }),
    {
      name: "donor-ui-state",
      partialize: (state) => ({
        search: state.search,
        bloodGroup: state.bloodGroup,
        status: state.status,
        pageSize: state.pageSize,
      }),
    }
  )
);

