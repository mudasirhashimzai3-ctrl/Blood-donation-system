import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HospitalUiState {
  search: string;
  city: string;
  isActive: "" | "true" | "false";
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setCity: (city: string) => void;
  setIsActive: (isActive: "" | "true" | "false") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useHospitalUiStore = create<HospitalUiState>()(
  persist(
    (set) => ({
      search: "",
      city: "",
      isActive: "",
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setCity: (city) => set({ city, page: 1 }),
      setIsActive: (isActive) => set({ isActive, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ search: "", city: "", isActive: "", page: 1 }),
    }),
    {
      name: "hospital-ui-state",
      partialize: (state) => ({
        search: state.search,
        city: state.city,
        isActive: state.isActive,
        pageSize: state.pageSize,
      }),
    }
  )
);

