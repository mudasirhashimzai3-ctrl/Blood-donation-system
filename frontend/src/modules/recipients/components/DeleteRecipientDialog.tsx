import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface DeleteRecipientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteRecipientDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteRecipientDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("recipients.delete.title", "Delete Recipient")}
      description={t(
        "recipients.delete.description",
        "Are you sure you want to delete this recipient? This action cannot be undone."
      )}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("recipients.actions.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t("recipients.actions.delete", "Delete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {t("recipients.delete.warning", "This will soft-delete the recipient record.")}
      </p>
    </Modal>
  );
}

