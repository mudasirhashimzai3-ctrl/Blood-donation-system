import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface ToggleHospitalStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isActive: boolean;
  loading?: boolean;
}

export default function ToggleHospitalStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  isActive,
  loading = false,
}: ToggleHospitalStatusDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isActive
          ? t("hospitals.status.deactivateTitle", "Deactivate Hospital")
          : t("hospitals.status.activateTitle", "Activate Hospital")
      }
      description={
        isActive
          ? t("hospitals.status.deactivateDescription", "This hospital will be hidden from recipient selection.")
          : t("hospitals.status.activateDescription", "This hospital will be available for recipient selection.")
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("hospitals.actions.cancel", "Cancel")}
          </Button>
          <Button variant={isActive ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {isActive
              ? t("hospitals.actions.deactivate", "Deactivate")
              : t("hospitals.actions.activate", "Activate")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {isActive
          ? t("hospitals.status.deactivateDescription", "This hospital will be hidden from recipient selection.")
          : t("hospitals.status.activateDescription", "This hospital will be available for recipient selection.")}
      </p>
    </Modal>
  );
}
