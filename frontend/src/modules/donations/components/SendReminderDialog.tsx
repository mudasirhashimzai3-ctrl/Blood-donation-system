import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox, Modal, ModalFooter } from "@components/ui";
import { DONATION_REMINDER_CHANNELS, type DonationReminderChannel } from "../types/donation.types";

interface SendReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (channels: DonationReminderChannel[]) => Promise<void>;
  loading?: boolean;
}

export default function SendReminderDialog({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: SendReminderDialogProps) {
  const { t } = useTranslation();
  const [selectedChannels, setSelectedChannels] = useState<DonationReminderChannel[]>(
    [...DONATION_REMINDER_CHANNELS]
  );

  const canConfirm = useMemo(() => selectedChannels.length > 0, [selectedChannels.length]);

  const toggleChannel = (channel: DonationReminderChannel, checked: boolean) => {
    setSelectedChannels((current) => {
      if (checked) return Array.from(new Set([...current, channel]));
      return current.filter((item) => item !== channel);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("donations.actions.sendReminder", "Send Reminder")}
      description={t(
        "donations.actions.sendReminderDescription",
        "Select reminder channels and dispatch now."
      )}
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={async () => {
            if (!canConfirm) return;
            await onSubmit(selectedChannels);
            onClose();
          }}
          confirmText={t("donations.actions.send", "Send")}
          loading={loading}
        />
      }
    >
      <div className="space-y-3">
        {DONATION_REMINDER_CHANNELS.map((channel) => (
          <Checkbox
            key={channel}
            checked={selectedChannels.includes(channel)}
            onChange={(event) => toggleChannel(channel, event.target.checked)}
            label={t(`donations.channels.${channel}`, channel)}
          />
        ))}
        {!canConfirm ? (
          <p className="text-xs text-error">
            {t("donations.errors.atLeastOneChannel", "Select at least one channel")}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
