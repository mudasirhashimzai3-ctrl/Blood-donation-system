import { useTranslation } from "react-i18next";
import { Badge } from "@components/ui";
import type { NotificationStatus } from "../types/notification.types";

const statusVariant: Record<NotificationStatus, "warning" | "info" | "success" | "error"> = {
  queued: "warning",
  sent: "info",
  delivered: "success",
  failed: "error",
};

interface NotificationStatusBadgeProps {
  status: NotificationStatus;
}

export default function NotificationStatusBadge({ status }: NotificationStatusBadgeProps) {
  const { t } = useTranslation();
  return <Badge variant={statusVariant[status]}>{t(`models.status.${status}`, status)}</Badge>;
}
