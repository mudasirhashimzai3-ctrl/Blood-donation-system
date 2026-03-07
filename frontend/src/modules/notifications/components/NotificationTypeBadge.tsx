import { Badge } from "@components/ui";
import type { NotificationType } from "../types/notification.types";

const typeVariant: Record<NotificationType, "primary" | "secondary" | "warning" | "info"> = {
  request_update: "primary",
  donation_update: "secondary",
  auth: "warning",
  system: "info",
  reminder: "secondary",
};

interface NotificationTypeBadgeProps {
  type: NotificationType;
}

export default function NotificationTypeBadge({ type }: NotificationTypeBadgeProps) {
  return <Badge variant={typeVariant[type]}>{type}</Badge>;
}
