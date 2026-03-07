import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import type { Donation } from "../types/donation.types";

interface TimelineRow {
  label: string;
  value: string | null;
}

interface DonationTimelineProps {
  donation: Donation;
}

export default function DonationTimeline({ donation }: DonationTimelineProps) {
  const { t } = useTranslation();
  const rows: TimelineRow[] = [
    {
      label: t("donations.timeline.notifiedAt", "Notified At"),
      value: donation.notified_at ? formatLocalDateTime(donation.notified_at) : null,
    },
    {
      label: t("donations.timeline.respondedAt", "Responded At"),
      value: donation.responded_at ? formatLocalDateTime(donation.responded_at) : null,
    },
    {
      label: t("donations.timeline.lastReminderAt", "Last Reminder"),
      value: donation.reminder_sent_at ? formatLocalDateTime(donation.reminder_sent_at) : null,
    },
    {
      label: t("donations.timeline.createdAt", "Created"),
      value: formatLocalDateTime(donation.created_at),
    },
    {
      label: t("donations.timeline.updatedAt", "Updated"),
      value: formatLocalDateTime(donation.updated_at),
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("donations.timeline.title", "Donation Timeline")}
        </h3>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-xs uppercase text-text-secondary">{row.label}</span>
              <span className="text-sm text-text-primary">{row.value || "-"}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
