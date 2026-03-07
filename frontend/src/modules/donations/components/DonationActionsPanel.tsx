import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Card, CardContent, Input, Select, Switch, Textarea } from "@components/ui";
import {
  DONATION_STATUS_OPTIONS,
  type Donation,
  type DonationReminderChannel,
  type DonationStatus,
} from "../types/donation.types";
import SendReminderDialog from "./SendReminderDialog";

interface DonationActionsPanelProps {
  donation: Donation;
  onStatusUpdate: (payload: {
    status: DonationStatus;
    notes?: string | null;
    cancellation_reason?: string | null;
  }) => Promise<unknown>;
  onSetPrimary: (value: boolean) => Promise<unknown>;
  onRefreshEstimate: () => Promise<unknown>;
  onSendReminder: (channels: DonationReminderChannel[]) => Promise<unknown>;
  loadingStates?: {
    status?: boolean;
    primary?: boolean;
    estimate?: boolean;
    reminder?: boolean;
  };
}

export default function DonationActionsPanel({
  donation,
  onStatusUpdate,
  onSetPrimary,
  onRefreshEstimate,
  onSendReminder,
  loadingStates,
}: DonationActionsPanelProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<DonationStatus>(donation.status);
  const [notes, setNotes] = useState(donation.notes ?? "");
  const [cancellationReason, setCancellationReason] = useState(donation.cancellation_reason ?? "");
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const isTerminal = useMemo(
    () => ["completed", "cancelled", "declined", "expired"].includes(donation.status),
    [donation.status]
  );

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">
            {t("donations.actions.title", "Actions")}
          </h3>

          <Switch
            checked={donation.is_primary}
            onChange={(event) => {
              onSetPrimary(event.target.checked);
            }}
            disabled={loadingStates?.primary}
            label={t("donations.actions.primaryToggle", "Set as primary")}
          />

          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as DonationStatus)}
            disabled={isTerminal}
            options={DONATION_STATUS_OPTIONS.map((value) => ({
              value,
              label: t(`donations.status.${value}`, value),
            }))}
          />

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            label={t("donations.actions.notes", "Notes")}
            rows={3}
          />

          {status === "cancelled" ? (
            <Input
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              label={t("donations.actions.cancellationReason", "Cancellation Reason")}
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              loading={loadingStates?.status}
              disabled={isTerminal}
              onClick={async () => {
                await onStatusUpdate({
                  status,
                  notes,
                  cancellation_reason: status === "cancelled" ? cancellationReason : null,
                });
              }}
            >
              {t("donations.actions.updateStatus", "Update Status")}
            </Button>
            <Button
              variant="outline"
              loading={loadingStates?.estimate}
              onClick={async () => {
                await onRefreshEstimate();
              }}
            >
              {t("donations.actions.refreshEstimate", "Refresh Estimate")}
            </Button>
            <Button
              variant="outline"
              loading={loadingStates?.reminder}
              disabled={donation.status !== "pending"}
              onClick={() => setIsReminderOpen(true)}
            >
              {t("donations.actions.sendReminder", "Send Reminder")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SendReminderDialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        loading={loadingStates?.reminder}
        onSubmit={async (channels) => {
          await onSendReminder(channels);
        }}
      />
    </>
  );
}
