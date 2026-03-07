import { useMemo } from "react";

import { useNotificationUiStore } from "../stores/useNotificationUiStore";

export const useNotificationFilters = () => {
  const {
    search,
    status,
    type,
    sentVia,
    priority,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setType,
    setSentVia,
    setPriority,
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
      priority: priority || undefined,
      ordering: ordering || undefined,
    }),
    [ordering, page, pageSize, priority, search, sentVia, status, type]
  );

  return {
    search,
    status,
    type,
    sentVia,
    priority,
    page,
    pageSize,
    ordering,
    setSearch,
    setStatus,
    setType,
    setSentVia,
    setPriority,
    setPage,
    setPageSize,
    setOrdering,
    resetFilters,
    queryParams,
  };
};
