import { useTranslation } from "react-i18next";

import { Badge } from "@components/ui";
import type { RecipientStatus } from "../types/recipient.types";

interface RecipientStatusBadgeProps {
  status: RecipientStatus;
}

export default function RecipientStatusBadge({ status }: RecipientStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === "active") {
    return (
      <Badge
        variant="success"
        dot
        className="border-success/25 bg-success-soft text-success"
        data-testid="recipient-status-active"
      >
        {t("recipients.status.active", "Active")}
      </Badge>
    );
  }

  if (status === "blocked") {
    return (
      <Badge
        variant="outline"
        icon={<span className="h-1.5 w-1.5 rounded-full bg-error" />}
        className="border-error/30 bg-error-soft text-error"
        data-testid="recipient-status-blocked"
      >
        {t("recipients.status.blocked", "Blocked")}
      </Badge>
    );
  }

  return (
    <Badge variant="success" dot className="border-success/25 bg-success-soft text-success" data-testid="recipient-status-active">
      {t("recipients.status.active", "Active")}
    </Badge>
  );
}
