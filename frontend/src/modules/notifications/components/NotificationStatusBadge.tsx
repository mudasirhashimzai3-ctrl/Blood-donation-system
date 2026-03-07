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
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
