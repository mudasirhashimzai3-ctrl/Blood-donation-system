import { Badge } from "@components/ui";
import { useTranslation } from "react-i18next";

import type { DonorStatus } from "../types/donor.types";

interface DonorStatusBadgeProps {
  status: DonorStatus;
}

export default function DonorStatusBadge({ status }: DonorStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge variant="success" dot data-testid={`donor-status-${status}`}>
      {t("donors.status.active", "Active")}
    </Badge>
  );
}
