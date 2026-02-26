import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface DeleteHospitalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteHospitalDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteHospitalDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("hospitals.delete.title", "Delete Hospital")}
      description={t(
        "hospitals.delete.description",
        "Are you sure you want to delete this hospital? This action cannot be undone."
      )}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("hospitals.actions.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t("hospitals.actions.delete", "Delete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {t("hospitals.delete.warning", "This will soft-delete the hospital record.")}
      </p>
    </Modal>
  );
}

