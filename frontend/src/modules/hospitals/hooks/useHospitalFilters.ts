import { useMemo } from "react";

import { useHospitalUiStore } from "../stores/useHospitalUiStore";
import type { Province } from "../types/hospital.types";

export const useHospitalFilters = () => {
  const {
    search,
    province,
    isActive,
    page,
    pageSize,
    setSearch,
    setProvince,
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
      province: province || undefined,
      is_active: isActive === "" ? undefined : isActive === "true",
    }),
    [isActive, page, pageSize, province, search]
  );

  return {
    search,
    province: province as Province | "",
    isActive,
    page,
    pageSize,
    setSearch,
    setProvince,
    setIsActive,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
