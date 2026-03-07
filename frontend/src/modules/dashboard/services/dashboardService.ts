import apiClient from "@/lib/api";
import type { DashboardOverviewQueryParams, DashboardOverviewResponse } from "../types/dashboard.types";

export const dashboardService = {
  getOverview: (params?: DashboardOverviewQueryParams) =>
    apiClient.get<DashboardOverviewResponse>("/reports/dashboard-overview/", { params }),
};
