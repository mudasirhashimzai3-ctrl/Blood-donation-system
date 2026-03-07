import { useMemo } from "react";

import { useBloodRequestUiStore } from "../stores/useBloodRequestUiStore";

export const useBloodRequestFilters = () => {
  const {
    search,
    status,
    bloodGroup,
    requestType,
    priority,
    isActive,
    page,
    pageSize,
    setSearch,
    setStatus,
    setBloodGroup,
    setRequestType,
    setPriority,
    setIsActive,
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
      is_active: isActive ?? undefined,
    }),
    [bloodGroup, isActive, page, pageSize, priority, requestType, search, status]
  );

  return {
    search,
    status,
    bloodGroup,
    requestType,
    priority,
    isActive,
    page,
    pageSize,
    setSearch,
    setStatus,
    setBloodGroup,
    setRequestType,
    setPriority,
    setIsActive,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
