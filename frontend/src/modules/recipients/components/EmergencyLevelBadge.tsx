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
      <Badge
        variant="outline"
        icon={<span className="recipient-critical-pulse" />}
        className="border-error/30 bg-error-soft text-error"
        data-testid="recipient-emergency-critical"
      >
        {t("recipients.emergency.critical", "Critical")}
      </Badge>
    );
  }

  if (level === "urgent") {
    return (
      <Badge
        variant="warning"
        dot
        className="border-warning/30 bg-warning-soft text-warning"
        data-testid="recipient-emergency-urgent"
      >
        {t("recipients.emergency.urgent", "Urgent")}
      </Badge>
    );
  }

  return (
    <Badge variant="info" dot className="border-info/25 bg-info-soft text-info" data-testid="recipient-emergency-normal">
      {t("recipients.emergency.normal", "Normal")}
    </Badge>
  );
}
