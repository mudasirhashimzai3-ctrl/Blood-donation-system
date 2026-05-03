import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BloodGroup, EmergencyLevel } from "../types/recipient.types";

interface RecipientUiState {
  bloodGroup: BloodGroup | "";
  emergencyLevel: EmergencyLevel | "";
  city: string;
  page: number;
  pageSize: number;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setEmergencyLevel: (emergencyLevel: EmergencyLevel | "") => void;
  setCity: (city: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useRecipientUiStore = create<RecipientUiState>()(
  persist(
    (set) => ({
      bloodGroup: "",
      emergencyLevel: "",
      city: "",
      page: 1,
      pageSize: 10,
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setEmergencyLevel: (emergencyLevel) => set({ emergencyLevel, page: 1 }),
      setCity: (city) => set({ city, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ bloodGroup: "", emergencyLevel: "", city: "", page: 1 }),
    }),
    {
      name: "recipient-ui-state",
      partialize: (state) => ({
        bloodGroup: state.bloodGroup,
        emergencyLevel: state.emergencyLevel,
        city: state.city,
        pageSize: state.pageSize,
      }),
    }
  )
);
