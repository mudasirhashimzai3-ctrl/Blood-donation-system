import { useEffect } from "react";

import DonationListPage from "@/modules/donations/pages/DonationListPage";
import { useDonationUiStore } from "@/modules/donations/stores/useDonationUiStore";

export default function DonorDonationActionsPage() {
  const setStatus = useDonationUiStore((state) => state.setStatus);

  useEffect(() => {
    setStatus("pending");
  }, [setStatus]);

  return <DonationListPage />;
}
