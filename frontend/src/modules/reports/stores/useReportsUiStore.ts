import { create } from "zustand";
import { persist } from "zustand/middleware";

import { REPORT_TABS, type ReportGroupBy, type ReportTab } from "../types/report.types";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

interface ReportsUiState {
  activeTab: ReportTab;
  dateFrom: string;
  dateTo: string;
  groupBy: ReportGroupBy;
  hospitalId: string;
  city: string;
  bloodGroup: string;
  requestType: string;
  search: string;
  ordering: string;
  page: number;
  pageSize: number;
  compareMode: boolean;
  setActiveTab: (tab: ReportTab) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setGroupBy: (value: ReportGroupBy) => void;
  setHospitalId: (value: string) => void;
  setCity: (value: string) => void;
  setBloodGroup: (value: string) => void;
  setRequestType: (value: string) => void;
  setSearch: (value: string) => void;
  setOrdering: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setCompareMode: (value: boolean) => void;
  resetFilters: () => void;
}

type ReportsPersistedState = Pick<
  ReportsUiState,
  | "activeTab"
  | "dateFrom"
  | "dateTo"
  | "groupBy"
  | "hospitalId"
  | "city"
  | "bloodGroup"
  | "requestType"
  | "pageSize"
  | "compareMode"
>;

const defaultFilters = {
  dateFrom: formatDate(thirtyDaysAgo),
  dateTo: formatDate(now),
  groupBy: "day" as const,
  hospitalId: "",
  city: "",
  bloodGroup: "",
  requestType: "",
  search: "",
  ordering: "",
  page: 1,
  pageSize: 25,
};

const isReportTab = (value: unknown): value is ReportTab =>
  typeof value === "string" && REPORT_TABS.includes(value as ReportTab);

const isReportGroupBy = (value: unknown): value is ReportGroupBy =>
  value === "day" || value === "week" || value === "month";

export const useReportsUiStore = create<ReportsUiState>()(
  persist(
    (set) => ({
      activeTab: "requests",
      ...defaultFilters,
      compareMode: false,
      setActiveTab: (activeTab) => set({ activeTab, page: 1, search: "", ordering: "" }),
      setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
      setDateTo: (dateTo) => set({ dateTo, page: 1 }),
      setGroupBy: (groupBy) => set({ groupBy, page: 1 }),
      setHospitalId: (hospitalId) => set({ hospitalId, page: 1 }),
      setCity: (city) => set({ city, page: 1 }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup, page: 1 }),
      setRequestType: (requestType) => set({ requestType, page: 1 }),
      setSearch: (search) => set({ search, page: 1 }),
      setOrdering: (ordering) => set({ ordering, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setCompareMode: (compareMode) => set({ compareMode }),
      resetFilters: () => set({ ...defaultFilters }),
    }),
    {
      name: "reports-ui-state",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<ReportsPersistedState>;
        return {
          dateFrom: state.dateFrom ?? defaultFilters.dateFrom,
          dateTo: state.dateTo ?? defaultFilters.dateTo,
          groupBy: isReportGroupBy(state.groupBy) ? state.groupBy : defaultFilters.groupBy,
          hospitalId: state.hospitalId ?? defaultFilters.hospitalId,
          city: state.city ?? defaultFilters.city,
          bloodGroup: state.bloodGroup ?? defaultFilters.bloodGroup,
          requestType: state.requestType ?? defaultFilters.requestType,
          pageSize: state.pageSize ?? defaultFilters.pageSize,
          compareMode: state.compareMode ?? false,
          activeTab: isReportTab(state.activeTab) ? state.activeTab : "requests",
        };
      },
      partialize: (state) => ({
        activeTab: state.activeTab,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        groupBy: state.groupBy,
        hospitalId: state.hospitalId,
        city: state.city,
        bloodGroup: state.bloodGroup,
        requestType: state.requestType,
        pageSize: state.pageSize,
        compareMode: state.compareMode,
      }),
    }
  )
);
