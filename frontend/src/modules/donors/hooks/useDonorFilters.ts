import { useMemo } from "react";

import { useDonorUiStore } from "../stores/useDonorUiStore";

export const useDonorFilters = () => {
  const {
    bloodGroup,
    page,
    pageSize,
    setBloodGroup,
    setPage,
    setPageSize,
    resetFilters,
  } = useDonorUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      blood_group: bloodGroup || undefined,
    }),
    [bloodGroup, page, pageSize]
  );

  return {
    bloodGroup,
    page,
    pageSize,
    setBloodGroup,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
