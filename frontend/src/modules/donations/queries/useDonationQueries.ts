import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { donationService } from "../services/donationService";
import type { DonationQueryParams, DonationReminderPayload, DonationStatusPayload, PaginatedDonations } from "../types/donation.types";
import { donationKeys } from "./donationKeys";

export const useDonationsList = (params?: DonationQueryParams) =>
  useQuery<PaginatedDonations>({
    queryKey: donationKeys.list(params),
    queryFn: () => donationService.getDonations(params).then((res) => res.data),
  });

export const useDonation = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: () => donationService.getDonation(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useUpdateDonationStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DonationStatusPayload) =>
      donationService.updateStatus(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Donation status updated");
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update donation status"));
    },
  });
};

export const useSetDonationPrimary = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isPrimary: boolean) => donationService.setPrimary(id, isPrimary).then((res) => res.data),
    onSuccess: () => {
      toast.success("Primary donor updated");
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update primary donor"));
    },
  });
};

export const useRefreshDonationEstimate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => donationService.refreshEstimate(id).then((res) => res.data),
    onSuccess: () => {
      toast.success("Estimate refreshed");
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to refresh estimate"));
    },
  });
};

export const useSendDonationReminder = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DonationReminderPayload) =>
      donationService.sendReminder(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Reminder sent");
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to send reminder"));
    },
  });
};
