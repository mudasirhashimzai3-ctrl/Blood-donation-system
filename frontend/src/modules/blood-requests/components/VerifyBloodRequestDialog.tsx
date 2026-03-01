import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface VerifyBloodRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified: boolean;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function VerifyBloodRequestDialog({
  isOpen,
  onClose,
  isVerified,
  onConfirm,
  loading = false,
}: VerifyBloodRequestDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isVerified
          ? t("bloodRequests.verify.unverifyTitle", "Unverify Request")
          : t("bloodRequests.verify.verifyTitle", "Verify Request")
      }
      description={
        isVerified
          ? t("bloodRequests.verify.unverifyDescription", "This request will be marked as unverified.")
          : t("bloodRequests.verify.verifyDescription", "This request will be marked as verified.")
      }
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
            {isVerified
              ? t("bloodRequests.actions.unverify", "Unverify")
              : t("bloodRequests.actions.verify", "Verify")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {t(
          "bloodRequests.verify.hint",
          "Verification indicates hospital documents have been reviewed."
        )}
      </p>
    </Modal>
  );
}
