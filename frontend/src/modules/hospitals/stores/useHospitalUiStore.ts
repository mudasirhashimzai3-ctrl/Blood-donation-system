import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Province } from "../types/hospital.types";

interface HospitalUiState {
  search: string;
  province: Province | "";
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setProvince: (province: Province | "") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useHospitalUiStore = create<HospitalUiState>()(
  persist(
    (set) => ({
      search: "",
      province: "",
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setProvince: (province) => set({ province, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ search: "", province: "", page: 1 }),
    }),
    {
      name: "hospital-ui-state",
      partialize: (state) => ({
        search: state.search,
        province: state.province,
        pageSize: state.pageSize,
      }),
    }
  )
);
