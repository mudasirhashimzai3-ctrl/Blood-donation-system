import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Badge variant={typeVariant[type]}>
      {t(`models.notificationTypes.${type}`, type)}
    </Badge>
  );
}
