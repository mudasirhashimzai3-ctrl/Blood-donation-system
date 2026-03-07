import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  BloodGroup,
  BloodRequestStatus,
  Priority,
  RequestType,
} from "../types/bloodRequest.types";

interface BloodRequestUiState {
  search: string;
  status: BloodRequestStatus | "";
  bloodGroup: BloodGroup | "";
  requestType: RequestType | "";
  priority: Priority | "";
  isActive: boolean | null;
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setStatus: (status: BloodRequestStatus | "") => void;
  setBloodGroup: (bloodGroup: BloodGroup | "") => void;
  setRequestType: (requestType: RequestType | "") => void;
  setPriority: (priority: Priority | "") => void;
  setIsActive: (isActive: boolean | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useBloodRequestUiStore = create<BloodRequestUiState>()(
  persist(
    (set) => ({
      search: "",
      status: "",
      bloodGroup: "",
      requestType: "",
      priority: "",
      isActive: null,
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setRequestType: (requestType) => set({ requestType, page: 1 }),
      setPriority: (priority) => set({ priority, page: 1 }),
      setIsActive: (isActive) => set({ isActive, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () =>
        set({
          search: "",
          status: "",
          bloodGroup: "",
          requestType: "",
          priority: "",
          isActive: null,
          page: 1,
        }),
    }),
    {
      name: "blood-request-ui-state",
      partialize: (state) => ({
        search: state.search,
        status: state.status,
        bloodGroup: state.bloodGroup,
        requestType: state.requestType,
        priority: state.priority,
        isActive: state.isActive,
        pageSize: state.pageSize,
      }),
    }
  )
);
