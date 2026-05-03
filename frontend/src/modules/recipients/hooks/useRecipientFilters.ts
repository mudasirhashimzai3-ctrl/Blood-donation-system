import { useMemo } from "react";

import { useRecipientUiStore } from "../stores/useRecipientUiStore";

export const useRecipientFilters = () => {
  const {
    bloodGroup,
    emergencyLevel,
    city,
    page,
    pageSize,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setPage,
    setPageSize,
    resetFilters,
  } = useRecipientUiStore();

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      required_blood_group: bloodGroup || undefined,
      emergency_level: emergencyLevel || undefined,
      city: city || undefined,
    }),
    [bloodGroup, city, emergencyLevel, page, pageSize]
  );

  return {
    bloodGroup,
    emergencyLevel,
    city,
    page,
    pageSize,
    setBloodGroup,
    setEmergencyLevel,
    setCity,
    setPage,
    setPageSize,
    resetFilters,
    queryParams,
  };
};
