import { useMemo } from "react";

import { useDonorUiStore } from "../stores/useDonorUiStore";

export const useDonorFilters = () => {
  const {
    search,
    bloodGroup,
    status,
    page,
    pageSize,
    setSearch,
    setBloodGroup,
    setStatus,
    setPage,
    setPageSize,
    resetFilters,
  } = useDonorUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      blood_group: bloodGroup || undefined,
      status: status || undefined,
    }),
    [bloodGroup, page, pageSize, search, status]
  );

  return {
    search,
    bloodGroup,
    status,
    page,
    pageSize,
    setSearch,
    setBloodGroup,
    setStatus,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};

