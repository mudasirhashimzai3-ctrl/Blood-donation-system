import { useQuery } from "@tanstack/react-query";

import { dashboardOverviewResponseSchema } from "../schemas/dashboardSchemas";
import { dashboardService } from "../services/dashboardService";
import type { DashboardOverviewQueryParams } from "../types/dashboard.types";
import { dashboardKeys } from "./dashboardKeys";

export const useDashboardOverview = (params: DashboardOverviewQueryParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: dashboardKeys.overview(params),
    queryFn: async () => {
      const response = await dashboardService.getOverview(params);
      return dashboardOverviewResponseSchema.parse(response.data);
    },
    enabled: options?.enabled ?? true,
  });
