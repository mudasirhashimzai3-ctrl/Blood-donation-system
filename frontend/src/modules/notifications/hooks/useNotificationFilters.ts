import { useMemo } from "react";

import { useNotificationUiStore } from "../stores/useNotificationUiStore";

export const useNotificationFilters = () => {
  const {
    status,
    type,
    sentVia,
    page,
    pageSize,
    ordering,
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
      status: status || undefined,
      type: type || undefined,
      sent_via: sentVia || undefined,
      ordering: ordering || undefined,
    }),
    [ordering, page, pageSize, sentVia, status, type]
  );

  return {
    status,
    type,
    sentVia,
    page,
    pageSize,
    ordering,
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
