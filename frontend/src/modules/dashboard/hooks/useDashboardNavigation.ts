import { useNavigate } from "react-router-dom";

import type { BloodGroup as DonorBloodGroup } from "@/modules/donors/types/donor.types";
import { useDonorUiStore } from "@/modules/donors/stores/useDonorUiStore";
import type { DonationStatus } from "@/modules/donations/types/donation.types";
import { useDonationUiStore } from "@/modules/donations/stores/useDonationUiStore";
import type {
  BloodGroup as BloodRequestBloodGroup,
  BloodRequestStatus,
} from "@/modules/blood-requests/types/bloodRequest.types";
import { useBloodRequestUiStore } from "@/modules/blood-requests/stores/useBloodRequestUiStore";
import { useRecipientUiStore } from "@/modules/recipients/stores/useRecipientUiStore";

export const useDashboardNavigation = () => {
  const navigate = useNavigate();

  const goToDonors = (bloodGroup?: string) => {
    const donorStore = useDonorUiStore.getState();
    donorStore.resetFilters();
    if (bloodGroup) {
      donorStore.setBloodGroup(bloodGroup as DonorBloodGroup);
    }
    navigate("/donors");
  };

  const goToRecipients = () => {
    const recipientStore = useRecipientUiStore.getState();
    recipientStore.resetFilters();
    navigate("/recipients");
  };

  const goToRequests = (input?: { status?: string; bloodGroup?: string; activeOnly?: boolean | null }) => {
    const bloodRequestStore = useBloodRequestUiStore.getState();
    bloodRequestStore.resetFilters();

    if (input?.activeOnly !== undefined) {
      bloodRequestStore.setIsActive(input.activeOnly);
    }

    if (input?.status) {
      bloodRequestStore.setStatus(input.status as BloodRequestStatus);
    }
    if (input?.bloodGroup) {
      bloodRequestStore.setBloodGroup(input.bloodGroup as BloodRequestBloodGroup);
    }
    navigate("/blood-requests");
  };

  const goToActiveRequests = (input?: { status?: string; bloodGroup?: string }) =>
    goToRequests({
      status: input?.status,
      bloodGroup: input?.bloodGroup,
      activeOnly: true,
    });

  const goToDonations = (status?: string) => {
    const donationStore = useDonationUiStore.getState();
    donationStore.resetFilters();
    if (status) {
      donationStore.setStatus(status as DonationStatus);
    }
    navigate("/donations");
  };

  return {
    goToDonors,
    goToRecipients,
    goToRequests,
    goToActiveRequests,
    goToDonations,
  };
};
