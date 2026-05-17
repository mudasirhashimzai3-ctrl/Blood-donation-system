import { useEffect } from "react";

import DonationListPage from "@/modules/donations/pages/DonationListPage";
import { useDonationUiStore } from "@/modules/donations/stores/useDonationUiStore";

export default function DonorDonationHistoryPage() {
  const setStatus = useDonationUiStore((state) => state.setStatus);

  useEffect(() => {
    setStatus("completed");
  }, [setStatus]);

  return <DonationListPage />;
}
