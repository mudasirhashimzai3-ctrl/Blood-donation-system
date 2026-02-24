import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface DeleteDonorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteDonorDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteDonorDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("donors.delete.title", "Delete Donor")}
      description={t(
        "donors.delete.description",
        "Are you sure you want to delete this donor? This action cannot be undone."
      )}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("donors.actions.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t("donors.actions.delete", "Delete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">{t("donors.delete.warning", "This will soft-delete the donor record.")}</p>
    </Modal>
  );
}

