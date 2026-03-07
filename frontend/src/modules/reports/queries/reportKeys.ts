import type { ReportsFilterParams } from "../types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  requestAnalytics: (params?: ReportsFilterParams) => [...reportKeys.all, "request", params] as const,
  donationAnalytics: (params?: ReportsFilterParams) => [...reportKeys.all, "donation", params] as const,
  hospitalPerformance: (params?: ReportsFilterParams) => [...reportKeys.all, "hospital", params] as const,
  emergencyAnalysis: (params?: ReportsFilterParams) => [...reportKeys.all, "emergency", params] as const,
  geographicDistance: (params?: ReportsFilterParams) => [...reportKeys.all, "geographic", params] as const,
  systemPerformance: (params?: ReportsFilterParams) => [...reportKeys.all, "system", params] as const,
  exportJobs: (params?: { page?: number; page_size?: number }) => [...reportKeys.all, "exports", params] as const,
  exportJobDetail: (id: number) => [...reportKeys.all, "exports", id] as const,
};
