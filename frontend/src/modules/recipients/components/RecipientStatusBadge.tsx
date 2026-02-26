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
      <Badge variant="success" dot>
        {t("recipients.status.active", "Active")}
      </Badge>
    );
  }

  if (status === "blocked") {
    return (
      <Badge variant="warning" dot>
        {t("recipients.status.blocked", "Blocked")}
      </Badge>
    );
  }

  return (
    <Badge variant="info" dot>
      {t("recipients.status.pending", "Pending")}
    </Badge>
  );
}

