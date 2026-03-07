import {
  useRefreshDonationEstimate,
  useSendDonationReminder,
  useSetDonationPrimary,
  useUpdateDonationStatus,
} from "../queries/useDonationQueries";
import type { DonationReminderPayload, DonationStatusPayload } from "../types/donation.types";

export const useDonationActions = (donationId: number) => {
  const updateStatusMutation = useUpdateDonationStatus(donationId);
  const setPrimaryMutation = useSetDonationPrimary(donationId);
  const refreshEstimateMutation = useRefreshDonationEstimate(donationId);
  const sendReminderMutation = useSendDonationReminder(donationId);

  return {
    updateStatus: (payload: DonationStatusPayload) => updateStatusMutation.mutateAsync(payload),
    setPrimary: (isPrimary: boolean) => setPrimaryMutation.mutateAsync(isPrimary),
    refreshEstimate: () => refreshEstimateMutation.mutateAsync(),
    sendReminder: (payload: DonationReminderPayload) => sendReminderMutation.mutateAsync(payload),
    isUpdatingStatus: updateStatusMutation.isPending,
    isSettingPrimary: setPrimaryMutation.isPending,
    isRefreshingEstimate: refreshEstimateMutation.isPending,
    isSendingReminder: sendReminderMutation.isPending,
  };
};
