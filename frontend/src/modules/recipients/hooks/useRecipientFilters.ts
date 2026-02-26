import { useMemo } from "react";

import { useRecipientUiStore } from "../stores/useRecipientUiStore";

export const useRecipientFilters = () => {
  const {
    search,
    bloodGroup,
    emergencyLevel,
    city,
    status,
    page,
    pageSize,
    setSearch,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setStatus,
    setPage,
    setPageSize,
    resetFilters,
  } = useRecipientUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      required_blood_group: bloodGroup || undefined,
      emergency_level: emergencyLevel || undefined,
      city: city || undefined,
      status: status || undefined,
    }),
    [bloodGroup, city, emergencyLevel, page, pageSize, search, status]
  );

  return {
    search,
    bloodGroup,
    emergencyLevel,
    city,
    status,
    page,
    pageSize,
    setSearch,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setStatus,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};

