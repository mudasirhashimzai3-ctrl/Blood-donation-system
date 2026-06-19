import { useTranslation } from "react-i18next";
import { Button, Select } from "@components/ui";
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
  type NotificationChannel,
  type NotificationStatus,
  type NotificationType,
} from "../types/notification.types";

interface NotificationFiltersProps {
  status: NotificationStatus | "";
  type: NotificationType | "";
  sentVia: NotificationChannel | "";
  onStatusChange: (value: NotificationStatus | "") => void;
  onTypeChange: (value: NotificationType | "") => void;
  onSentViaChange: (value: NotificationChannel | "") => void;
  onReset: () => void;
}

export default function NotificationFilters({
  status,
  type,
  sentVia,
  onStatusChange,
  onTypeChange,
  onSentViaChange,
  onReset,
}: NotificationFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as NotificationStatus | "")}
        options={[
          { value: "", label: t("notifications.filters.allStatuses", "All statuses") },
          ...NOTIFICATION_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: t(`models.status.${item}`, item),
          })),
        ]}
        className="flex-1"
      />
      <Select
        value={type}
        onChange={(event) => onTypeChange(event.target.value as NotificationType | "")}
        options={[
          { value: "", label: t("notifications.filters.allTypes", "All types") },
          ...NOTIFICATION_TYPE_OPTIONS.map((item) => ({
            value: item,
            label: t(`models.notificationTypes.${item}`, item),
          })),
        ]}
        className="flex-1"
      />
      <Select
        value={sentVia}
        onChange={(event) => onSentViaChange(event.target.value as NotificationChannel | "")}
        options={[
          { value: "", label: t("notifications.filters.allChannels", "All channels") },
          ...NOTIFICATION_CHANNEL_OPTIONS.map((item) => ({
            value: item,
            label: t(`models.channels.${item}`, item),
          })),
        ]}
        className="flex-1"
      />
      <Button variant="outline" onClick={onReset} className="flex-shrink-0">
        {t("notifications.filters.reset", "Reset")}
      </Button>
    </div>
  );
}
