import { useTranslation } from "react-i18next";
import { Button } from "@components/ui";

interface MarkAllReadButtonProps {
  onClick: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export default function MarkAllReadButton({
  onClick,
  loading = false,
  disabled = false,
}: MarkAllReadButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={loading}
      disabled={disabled}
      onClick={async () => {
        await onClick();
      }}
    >
      {t("notifications.actions.markAllRead", "Mark all read")}
    </Button>
  );
}
