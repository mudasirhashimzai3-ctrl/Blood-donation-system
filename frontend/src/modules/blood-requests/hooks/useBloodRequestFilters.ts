import { useMemo } from "react";

import { useBloodRequestUiStore } from "../stores/useBloodRequestUiStore";

export const useBloodRequestFilters = () => {
  const {
    search,
    status,
    bloodGroup,
    requestType,
    priority,
    page,
    pageSize,
    setSearch,
    setStatus,
    setBloodGroup,
    setRequestType,
    setPriority,
    setPage,
    setPageSize,
    resetFilters,
  } = useBloodRequestUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
      blood_group: bloodGroup || undefined,
      request_type: requestType || undefined,
      priority: priority || undefined,
    }),
    [bloodGroup, page, pageSize, priority, requestType, search, status]
  );

  return {
    search,
    status,
    bloodGroup,
    requestType,
    priority,
    page,
    pageSize,
    setSearch,
    setStatus,
    setBloodGroup,
    setRequestType,
    setPriority,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
