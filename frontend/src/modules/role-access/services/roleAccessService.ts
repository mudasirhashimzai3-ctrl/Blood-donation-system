import apiClient from "@/lib/api";

import type {
  DonorDashboardResponse,
  RecipientDashboardResponse,
  RecipientDonorResponseGroup,
} from "../types/roleAccess.types";

export const roleAccessService = {
  getDonorDashboard: () =>
    apiClient.get<DonorDashboardResponse>("/donors/mobile-dashboard/"),

  getRecipientDashboard: () =>
    apiClient.get<RecipientDashboardResponse>("/recipients/mobile-dashboard/"),

  getRecipientDonorResponses: () =>
    apiClient.get<RecipientDonorResponseGroup[]>("/blood-requests/donor-responses/"),
};
