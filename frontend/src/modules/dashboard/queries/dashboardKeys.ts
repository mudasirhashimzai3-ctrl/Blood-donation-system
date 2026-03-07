import type { DashboardOverviewQueryParams } from "../types/dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (params?: DashboardOverviewQueryParams) => [...dashboardKeys.all, "overview", params] as const,
};
