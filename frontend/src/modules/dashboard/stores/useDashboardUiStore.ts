import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DashboardGroupBy } from "../types/dashboard.types";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

interface DashboardUiState {
  dateFrom: string;
  dateTo: string;
  groupBy: DashboardGroupBy;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setGroupBy: (value: DashboardGroupBy) => void;
  resetFilters: () => void;
}

const defaults = {
  dateFrom: formatDate(thirtyDaysAgo),
  dateTo: formatDate(now),
  groupBy: "day" as const,
};

export const useDashboardUiStore = create<DashboardUiState>()(
  persist(
    (set) => ({
      ...defaults,
      setDateFrom: (dateFrom) => set({ dateFrom }),
      setDateTo: (dateTo) => set({ dateTo }),
      setGroupBy: (groupBy) => set({ groupBy }),
      resetFilters: () => set({ ...defaults }),
    }),
    {
      name: "dashboard-ui-state",
      partialize: (state) => ({
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        groupBy: state.groupBy,
      }),
    }
  )
);
