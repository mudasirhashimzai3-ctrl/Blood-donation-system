import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { RequestType } from "../types/bloodRequest.types";

interface BloodRequestTypeBadgeProps {
  requestType: RequestType;
}

export default function BloodRequestTypeBadge({ requestType }: BloodRequestTypeBadgeProps) {
  const { t } = useTranslation();

  if (requestType === "critical") {
    return <Badge variant="danger">{t("bloodRequests.type.critical", "Critical")}</Badge>;
  }
  if (requestType === "urgent") {
    return <Badge variant="warning">{t("bloodRequests.type.urgent", "Urgent")}</Badge>;
  }
  return <Badge variant="info">{t("bloodRequests.type.normal", "Normal")}</Badge>;
}
