import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";
import type { BloodRequestNotification } from "../types/bloodRequest.types";

interface AssignDonorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BloodRequestNotification[];
  onAssign: (donorId: number) => Promise<void>;
  loading?: boolean;
}

export default function AssignDonorDialog({
  isOpen,
  onClose,
  notifications,
  onAssign,
  loading = false,
}: AssignDonorDialogProps) {
  const { t } = useTranslation();
  const candidates = notifications.filter((item) => item.response_status !== "expired");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bloodRequests.assign.title", "Assign Donor")}
      description={t("bloodRequests.assign.subtitle", "Select a donor from matched candidates")}
    >
      {candidates.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {t("bloodRequests.assign.empty", "No candidates available. Run auto-match first.")}
        </p>
      ) : (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{candidate.donor_name}</p>
                <p className="text-xs text-text-secondary">
                  {candidate.donor_phone} - {candidate.distance_km} km
                </p>
              </div>
              <Button
                size="sm"
                loading={loading}
                onClick={async () => {
                  await onAssign(candidate.donor);
                  onClose();
                }}
              >
                {t("bloodRequests.actions.assign", "Assign")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
