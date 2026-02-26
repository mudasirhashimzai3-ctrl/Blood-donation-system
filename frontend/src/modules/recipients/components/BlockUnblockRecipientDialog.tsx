import { useTranslation } from "react-i18next";

import { Button, Modal } from "@components/ui";

interface BlockUnblockRecipientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBlocked: boolean;
  loading?: boolean;
}

export default function BlockUnblockRecipientDialog({
  isOpen,
  onClose,
  onConfirm,
  isBlocked,
  loading = false,
}: BlockUnblockRecipientDialogProps) {
  const { t } = useTranslation();

  const title = isBlocked
    ? t("recipients.block.unblockTitle", "Unblock Recipient")
    : t("recipients.block.blockTitle", "Block Recipient");
  const description = isBlocked
    ? t("recipients.block.unblockDescription", "This recipient will be set to active.")
    : t("recipients.block.blockDescription", "This recipient will be blocked from active operations.");
  const confirmText = isBlocked
    ? t("recipients.actions.unblock", "Unblock")
    : t("recipients.actions.block", "Block");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("recipients.actions.cancel", "Cancel")}
          </Button>
          <Button variant={isBlocked ? "primary" : "danger"} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {isBlocked
          ? t("recipients.block.unblockHint", "Unblocking always sets status to Active.")
          : t("recipients.block.blockHint", "Blocked recipients can be unblocked later.")}
      </p>
    </Modal>
  );
}

