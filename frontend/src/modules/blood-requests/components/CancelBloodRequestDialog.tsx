import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input, Modal } from "@components/ui";

interface CancelBloodRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string | null) => Promise<void>;
  loading?: boolean;
}

export default function CancelBloodRequestDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: CancelBloodRequestDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bloodRequests.cancel.title", "Cancel Blood Request")}
      description={t("bloodRequests.cancel.description", "This request will be marked as cancelled.")}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              setReason("");
              onClose();
            }}
            disabled={loading}
          >
            {t("bloodRequests.actions.close", "Close")}
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={async () => {
              await onConfirm(reason.trim() ? reason.trim() : null);
              setReason("");
              onClose();
            }}
          >
            {t("bloodRequests.actions.cancelRequest", "Cancel Request")}
          </Button>
        </>
      }
    >
      <Input
        label={t("bloodRequests.cancel.reason", "Rejection reason (optional)")}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
    </Modal>
  );
}
