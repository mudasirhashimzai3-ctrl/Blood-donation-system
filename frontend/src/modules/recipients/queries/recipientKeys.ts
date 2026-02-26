import type { RecipientQueryParams } from "../types/recipient.types";

export const recipientKeys = {
  all: ["recipients"] as const,
  lists: () => [...recipientKeys.all, "list"] as const,
  list: (params?: RecipientQueryParams) => [...recipientKeys.lists(), params] as const,
  details: () => [...recipientKeys.all, "detail"] as const,
  detail: (id: number) => [...recipientKeys.details(), id] as const,
};

