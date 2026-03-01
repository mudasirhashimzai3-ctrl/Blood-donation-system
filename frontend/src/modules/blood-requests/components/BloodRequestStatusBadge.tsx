import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { BloodRequestStatus } from "../types/bloodRequest.types";

interface BloodRequestStatusBadgeProps {
  status: BloodRequestStatus;
}

export default function BloodRequestStatusBadge({ status }: BloodRequestStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === "matched") {
    return <Badge variant="info">{t("bloodRequests.status.matched", "Matched")}</Badge>;
  }
  if (status === "completed") {
    return <Badge variant="success">{t("bloodRequests.status.completed", "Completed")}</Badge>;
  }
  if (status === "cancelled") {
    return <Badge variant="danger">{t("bloodRequests.status.cancelled", "Cancelled")}</Badge>;
  }
  return <Badge variant="warning">{t("bloodRequests.status.pending", "Pending")}</Badge>;
}
