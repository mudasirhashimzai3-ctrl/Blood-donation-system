import apiClient from "@/lib/api";
import type {
  PaginatedRecipients,
  Recipient,
  RecipientPayload,
  RecipientQueryParams,
} from "../types/recipient.types";
import type {
  RecipientDashboardResponse,
  RecipientDonorResponseGroup,
} from "@/modules/role-access/types/roleAccess.types";

export const recipientService = {
  getRecipients: (params?: RecipientQueryParams) =>
    apiClient.get<PaginatedRecipients>("/recipients/", { params }),

  getRecipient: (id: number) => apiClient.get<Recipient>(`/recipients/${id}/`),

  getRecipientDashboard: () => apiClient.get<RecipientDashboardResponse>("/recipients/mobile-dashboard/"),

  getDonorResponses: () =>
    apiClient.get<RecipientDonorResponseGroup[]>("/blood-requests/donor-responses/"),

  createRecipient: (payload: RecipientPayload) =>
    apiClient.post<Recipient>("/recipients/", payload),

  updateRecipient: (id: number, payload: Partial<RecipientPayload>) =>
    apiClient.patch<Recipient>(`/recipients/${id}/`, payload),

  deleteRecipient: (id: number) => apiClient.delete(`/recipients/${id}/`),
};
