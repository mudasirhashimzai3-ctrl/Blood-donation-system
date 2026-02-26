import type { HospitalQueryParams } from "../types/hospital.types";

export const hospitalKeys = {
  all: ["hospitals"] as const,
  lists: () => [...hospitalKeys.all, "list"] as const,
  list: (params?: HospitalQueryParams) => [...hospitalKeys.lists(), params] as const,
  details: () => [...hospitalKeys.all, "detail"] as const,
  detail: (id: number) => [...hospitalKeys.details(), id] as const,
};

