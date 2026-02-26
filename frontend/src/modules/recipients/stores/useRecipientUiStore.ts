import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BloodGroup, EmergencyLevel, RecipientStatus } from "../types/recipient.types";

interface RecipientUiState {
  search: string;
  bloodGroup: BloodGroup | "";
  emergencyLevel: EmergencyLevel | "";
  city: string;
  status: RecipientStatus | "";
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setEmergencyLevel: (emergencyLevel: EmergencyLevel | "") => void;
  setCity: (city: string) => void;
  setStatus: (status: RecipientStatus | "") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useRecipientUiStore = create<RecipientUiState>()(
  persist(
    (set) => ({
      search: "",
      bloodGroup: "",
      emergencyLevel: "",
      city: "",
      status: "",
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setEmergencyLevel: (emergencyLevel) => set({ emergencyLevel, page: 1 }),
      setCity: (city) => set({ city, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ search: "", bloodGroup: "", emergencyLevel: "", city: "", status: "", page: 1 }),
    }),
    {
      name: "recipient-ui-state",
      partialize: (state) => ({
        search: state.search,
        bloodGroup: state.bloodGroup,
        emergencyLevel: state.emergencyLevel,
        city: state.city,
        status: state.status,
        pageSize: state.pageSize,
      }),
    }
  )
);

