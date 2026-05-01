import { useMemo } from "react";

import { useDonorUiStore } from "../stores/useDonorUiStore";

export const useDonorFilters = () => {
  const {
    bloodGroup,
    city,
    page,
    pageSize,
    setBloodGroup,
    setCity,
    setPage,
    setPageSize,
    resetFilters,
  } = useDonorUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      blood_group: bloodGroup || undefined,
      local_address_city: city || undefined,
    }),
    [bloodGroup, city, page, pageSize]
  );

  return {
    bloodGroup,
    city,
    page,
    pageSize,
    setBloodGroup,
    setCity,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
