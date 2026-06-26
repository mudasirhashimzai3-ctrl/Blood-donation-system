import { useMemo } from "react";

import { useNotificationUiStore } from "../stores/useNotificationUiStore";

export const useNotificationFilters = () => {
  const {
    search,
    status,
    type,
    sentVia,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setType,
    setSentVia,
    setPage,
    setPageSize,
    setOrdering,
    resetFilters,
  } = useNotificationUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
      type: type || undefined,
      sent_via: sentVia || undefined,
      ordering: ordering || undefined,
    }),
    [ordering, page, pageSize, search, sentVia, status, type]
  );

  return {
    search,
    status,
    type,
    sentVia,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setType,
    setSentVia,
    setPage,
    setPageSize,
    setOrdering,
    resetFilters,
    queryParams,
  };
};
