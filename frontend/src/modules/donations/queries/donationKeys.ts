import type { DonationQueryParams } from "../types/donation.types";

export const donationKeys = {
  all: ["donations"] as const,
  lists: () => [...donationKeys.all, "list"] as const,
  list: (params?: DonationQueryParams) => [...donationKeys.lists(), params] as const,
  details: () => [...donationKeys.all, "detail"] as const,
  detail: (id: number) => [...donationKeys.details(), id] as const,
};
