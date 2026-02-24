import type { DonorQueryParams } from "../types/donor.types";

export const donorKeys = {
  all: ["donors"] as const,
  lists: () => [...donorKeys.all, "list"] as const,
  list: (params?: DonorQueryParams) => [...donorKeys.lists(), params] as const,
  details: () => [...donorKeys.all, "detail"] as const,
  detail: (id: number) => [...donorKeys.details(), id] as const,
};

