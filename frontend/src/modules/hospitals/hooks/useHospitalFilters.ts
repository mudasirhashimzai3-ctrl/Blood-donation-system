import { useMemo } from "react";

import { useHospitalUiStore } from "../stores/useHospitalUiStore";

export const useHospitalFilters = () => {
  const {
    search,
    city,
    isActive,
    page,
    pageSize,
    setSearch,
    setCity,
    setIsActive,
    setPage,
    setPageSize,
    resetFilters,
  } = useHospitalUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      city: city || undefined,
      is_active: isActive === "" ? undefined : isActive === "true",
    }),
    [city, isActive, page, pageSize, search]
  );

  return {
    search,
    city,
    isActive,
    page,
    pageSize,
    setSearch,
    setCity,
    setIsActive,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};

