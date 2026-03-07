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
      Mark all read
    </Button>
  );
}
