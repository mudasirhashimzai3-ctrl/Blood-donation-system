import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { DonationStatus } from "../types/donation.types";

const statusVariant: Record<DonationStatus, "warning" | "info" | "primary" | "success" | "danger" | "error"> = {
  pending: "warning",
  accepted: "info",
  en_route: "primary",
  arrived: "primary",
  completed: "success",
  cancelled: "danger",
  declined: "error",
  expired: "error",
};

interface DonationStatusBadgeProps {
  status: DonationStatus;
}

export default function DonationStatusBadge({ status }: DonationStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge variant={statusVariant[status]}>
      {t(`donations.status.${status}`, status)}
    </Badge>
  );
}
