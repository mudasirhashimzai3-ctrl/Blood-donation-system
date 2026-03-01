import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { Priority } from "../types/bloodRequest.types";

interface BloodRequestPriorityBadgeProps {
  priority: Priority;
}

export default function BloodRequestPriorityBadge({ priority }: BloodRequestPriorityBadgeProps) {
  const { t } = useTranslation();

  if (priority === "critical") {
    return <Badge variant="danger">{t("bloodRequests.priority.critical", "Critical")}</Badge>;
  }
  if (priority === "high") {
    return <Badge variant="error">{t("bloodRequests.priority.high", "High")}</Badge>;
  }
  if (priority === "medium") {
    return <Badge variant="warning">{t("bloodRequests.priority.medium", "Medium")}</Badge>;
  }
  return <Badge variant="outline">{t("bloodRequests.priority.low", "Low")}</Badge>;
}
