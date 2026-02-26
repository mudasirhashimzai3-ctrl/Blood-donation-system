import apiClient from "@/lib/api";
import type {
  PaginatedRecipients,
  Recipient,
  RecipientPayload,
  RecipientQueryParams,
} from "../types/recipient.types";

export const recipientService = {
  getRecipients: (params?: RecipientQueryParams) =>
    apiClient.get<PaginatedRecipients>("/recipients/", { params }),

  getRecipient: (id: number) => apiClient.get<Recipient>(`/recipients/${id}/`),

  createRecipient: (payload: RecipientPayload) =>
    apiClient.post<Recipient>("/recipients/", payload),

  updateRecipient: (id: number, payload: Partial<RecipientPayload>) =>
    apiClient.patch<Recipient>(`/recipients/${id}/`, payload),

  deleteRecipient: (id: number) => apiClient.delete(`/recipients/${id}/`),

  blockRecipient: (id: number) => apiClient.patch<Recipient>(`/recipients/${id}/block/`, {}),

  unblockRecipient: (id: number) => apiClient.patch<Recipient>(`/recipients/${id}/unblock/`, {}),
};

