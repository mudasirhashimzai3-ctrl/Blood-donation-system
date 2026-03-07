import { Button, Input, Select } from "@components/ui";
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_PRIORITY_OPTIONS,
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
  type NotificationChannel,
  type NotificationPriority,
  type NotificationStatus,
  type NotificationType,
} from "../types/notification.types";

interface NotificationFiltersProps {
  search: string;
  status: NotificationStatus | "";
  type: NotificationType | "";
  sentVia: NotificationChannel | "";
  priority: NotificationPriority | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: NotificationStatus | "") => void;
  onTypeChange: (value: NotificationType | "") => void;
  onSentViaChange: (value: NotificationChannel | "") => void;
  onPriorityChange: (value: NotificationPriority | "") => void;
  onReset: () => void;
}

export default function NotificationFilters({
  search,
  status,
  type,
  sentVia,
  priority,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSentViaChange,
  onPriorityChange,
  onReset,
}: NotificationFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search title/message"
      />
      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as NotificationStatus | "")}
        options={[
          { value: "", label: "All statuses" },
          ...NOTIFICATION_STATUS_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <Select
        value={type}
        onChange={(event) => onTypeChange(event.target.value as NotificationType | "")}
        options={[
          { value: "", label: "All types" },
          ...NOTIFICATION_TYPE_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <Select
        value={sentVia}
        onChange={(event) => onSentViaChange(event.target.value as NotificationChannel | "")}
        options={[
          { value: "", label: "All channels" },
          ...NOTIFICATION_CHANNEL_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <Select
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value as NotificationPriority | "")}
        options={[
          { value: "", label: "All priorities" },
          ...NOTIFICATION_PRIORITY_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
