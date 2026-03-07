import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DonationStatus } from "../types/donation.types";

interface DonationUiState {
  search: string;
  status: DonationStatus | "";
  page: number;
  pageSize: number;
  ordering: string;
  setSearch: (value: string) => void;
  setStatus: (value: DonationStatus | "") => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setOrdering: (value: string) => void;
  resetFilters: () => void;
}

export const useDonationUiStore = create<DonationUiState>()(
  persist(
    (set) => ({
      search: "",
      status: "",
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setOrdering: (ordering) => set({ ordering, page: 1 }),
      resetFilters: () => set({ search: "", status: "", page: 1, ordering: "-created_at" }),
    }),
    {
      name: "donation-ui-state",
      partialize: (state) => ({
        search: state.search,
        status: state.status,
        pageSize: state.pageSize,
        ordering: state.ordering,
      }),
    }
  )
);
