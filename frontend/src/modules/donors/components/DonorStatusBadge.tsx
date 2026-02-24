import { Badge } from "@components/ui";
import { useTranslation } from "react-i18next";

import type { DonorStatus } from "../types/donor.types";

interface DonorStatusBadgeProps {
  status: DonorStatus;
}

export default function DonorStatusBadge({ status }: DonorStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === "active") {
    return (
      <Badge variant="success" dot>
        {t("donors.status.active", "Active")}
      </Badge>
    );
  }

  if (status === "blocked") {
    return (
      <Badge variant="warning" dot>
        {t("donors.status.blocked", "Blocked")}
      </Badge>
    );
  }

  return (
    <Badge variant="info" dot>
      {t("donors.status.pending", "Pending")}
    </Badge>
  );
}
