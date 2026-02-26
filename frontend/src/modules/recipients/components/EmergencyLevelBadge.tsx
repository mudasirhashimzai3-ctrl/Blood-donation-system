import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { EmergencyLevel } from "../types/recipient.types";

interface EmergencyLevelBadgeProps {
  level: EmergencyLevel;
}

export default function EmergencyLevelBadge({ level }: EmergencyLevelBadgeProps) {
  const { t } = useTranslation();

  if (level === "critical") {
    return (
      <Badge variant="danger" dot>
        {t("recipients.emergency.critical", "Critical")}
      </Badge>
    );
  }

  if (level === "urgent") {
    return (
      <Badge variant="warning" dot>
        {t("recipients.emergency.urgent", "Urgent")}
      </Badge>
    );
  }

  return (
    <Badge variant="info" dot>
      {t("recipients.emergency.normal", "Normal")}
    </Badge>
  );
}

