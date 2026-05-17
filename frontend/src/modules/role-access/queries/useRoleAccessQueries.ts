import { useQuery } from "@tanstack/react-query";

import { roleAccessService } from "../services/roleAccessService";

export const roleAccessKeys = {
  donorDashboard: ["role-access", "donor-dashboard"] as const,
  recipientDashboard: ["role-access", "recipient-dashboard"] as const,
  recipientDonorResponses: ["role-access", "recipient-donor-responses"] as const,
};

export const useDonorDashboard = () =>
  useQuery({
    queryKey: roleAccessKeys.donorDashboard,
    queryFn: () => roleAccessService.getDonorDashboard().then((res) => res.data),
  });

export const useRecipientDashboard = () =>
  useQuery({
    queryKey: roleAccessKeys.recipientDashboard,
    queryFn: () => roleAccessService.getRecipientDashboard().then((res) => res.data),
  });

export const useRecipientDonorResponses = () =>
  useQuery({
    queryKey: roleAccessKeys.recipientDonorResponses,
    queryFn: () => roleAccessService.getRecipientDonorResponses().then((res) => res.data),
  });
