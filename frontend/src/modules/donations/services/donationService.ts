import apiClient from "@/lib/api";
import type {
  Donation,
  DonationQueryParams,
  DonationReminderPayload,
  DonationReminderResult,
  DonationStatusPayload,
  PaginatedDonations,
} from "../types/donation.types";

export const donationService = {
  getDonations: (params?: DonationQueryParams) =>
    apiClient.get<PaginatedDonations>("/donations/", { params }),

  getDonation: (id: number) => apiClient.get<Donation>(`/donations/${id}/`),

  updateStatus: (id: number, payload: DonationStatusPayload) =>
    apiClient.patch<Donation>(`/donations/${id}/status/`, payload),

  setPrimary: (id: number, isPrimary: boolean) =>
    apiClient.patch<Donation>(`/donations/${id}/set-primary/`, { is_primary: isPrimary }),

  refreshEstimate: (id: number) => apiClient.post<Donation>(`/donations/${id}/refresh-estimate/`, {}),

  sendReminder: (id: number, payload: DonationReminderPayload) =>
    apiClient.post<{ donation: Donation; result: DonationReminderResult }>(
      `/donations/${id}/send-reminder/`,
      payload
    ),
};
