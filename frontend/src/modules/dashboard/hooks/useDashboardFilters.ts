import { useMemo } from "react";

import type { DashboardOverviewQueryParams } from "../types/dashboard.types";
import { useDashboardUiStore } from "../stores/useDashboardUiStore";

const toStartOfDayIso = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const toEndOfDayIso = (date: string) => new Date(`${date}T23:59:59`).toISOString();

export const useDashboardFilters = () => {
  const state = useDashboardUiStore();

  const queryParams = useMemo<DashboardOverviewQueryParams>(
    () => ({
      date_from: state.dateFrom ? toStartOfDayIso(state.dateFrom) : undefined,
      date_to: state.dateTo ? toEndOfDayIso(state.dateTo) : undefined,
      group_by: state.groupBy,
    }),
    [state.dateFrom, state.dateTo, state.groupBy]
  );

  return {
    ...state,
    queryParams,
  };
};
