import type { BloodRequestQueryParams } from "../types/bloodRequest.types";

export const bloodRequestKeys = {
  all: ["blood-requests"] as const,
  lists: () => [...bloodRequestKeys.all, "list"] as const,
  list: (params?: BloodRequestQueryParams) => [...bloodRequestKeys.lists(), params] as const,
  details: () => [...bloodRequestKeys.all, "detail"] as const,
  detail: (id: number) => [...bloodRequestKeys.details(), id] as const,
  notifications: (id: number) => [...bloodRequestKeys.detail(id), "notifications"] as const,
};
