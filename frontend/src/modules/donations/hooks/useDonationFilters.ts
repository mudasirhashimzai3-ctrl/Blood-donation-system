import { useMemo } from "react";

import { useDonationUiStore } from "../stores/useDonationUiStore";

export const useDonationFilters = () => {
  const {
    search,
    status,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setPage,
    setPageSize,
    setOrdering,
    resetFilters,
  } = useDonationUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
      ordering: ordering || undefined,
    }),
    [ordering, page, pageSize, search, status]
  );

  return {
    search,
    status,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setPage,
    setPageSize,
    setOrdering,
    resetFilters,
    queryParams,
  };
};
