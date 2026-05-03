import { useMemo } from "react";

import { useHospitalUiStore } from "../stores/useHospitalUiStore";
import type { Province } from "../types/hospital.types";

export const useHospitalFilters = () => {
  const {
    search,
    province,
    page,
    pageSize,
    setSearch,
    setProvince,
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
    }),
    [page, pageSize, province, search]
  );

  return {
    search,
    province: province as Province | "",
    page,
    pageSize,
    setSearch,
    setProvince,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
