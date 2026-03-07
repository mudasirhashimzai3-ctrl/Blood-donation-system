import { useMemo } from "react";

import type { ReportsFilterParams } from "../types/report.types";
import { useReportsUiStore } from "../stores/useReportsUiStore";

const toStartOfDayIso = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const toEndOfDayIso = (date: string) => new Date(`${date}T23:59:59`).toISOString();

export const useReportFilters = () => {
  const state = useReportsUiStore();

  const queryParams = useMemo<ReportsFilterParams>(
    () => ({
      date_from: state.dateFrom ? toStartOfDayIso(state.dateFrom) : undefined,
      date_to: state.dateTo ? toEndOfDayIso(state.dateTo) : undefined,
      group_by: state.groupBy,
      hospital_id: state.hospitalId ? Number(state.hospitalId) : undefined,
      city: state.city || undefined,
      blood_group: state.bloodGroup || undefined,
      request_type: state.requestType || undefined,
      priority: state.priority || undefined,
      emergency_only: state.emergencyOnly || undefined,
      status: state.status || undefined,
      search: state.search || undefined,
      ordering: state.ordering || undefined,
      page: state.page,
      page_size: state.pageSize,
    }),
    [
      state.bloodGroup,
      state.city,
      state.dateFrom,
      state.dateTo,
      state.emergencyOnly,
      state.groupBy,
      state.hospitalId,
      state.ordering,
      state.page,
      state.pageSize,
      state.priority,
      state.requestType,
      state.search,
      state.status,
    ]
  );

  return {
    ...state,
    queryParams,
  };
};
