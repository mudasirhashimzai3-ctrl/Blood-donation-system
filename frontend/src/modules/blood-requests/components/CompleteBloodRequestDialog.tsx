import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface CompleteBloodRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function CompleteBloodRequestDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: CompleteBloodRequestDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bloodRequests.complete.title", "Complete Blood Request")}
      description={t(
        "bloodRequests.complete.description",
        "Mark this matched request as completed."
      )}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("bloodRequests.actions.close", "Close")}
          </Button>
          <Button
            loading={loading}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            {t("bloodRequests.actions.complete", "Complete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {t(
          "bloodRequests.complete.warning",
          "Completed requests are terminal and cannot be edited."
        )}
      </p>
    </Modal>
  );
}
