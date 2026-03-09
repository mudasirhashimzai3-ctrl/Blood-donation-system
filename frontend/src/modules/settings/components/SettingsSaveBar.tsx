import { Button } from "@components/ui";

interface SettingsSaveBarProps {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function SettingsSaveBar({
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
  readOnly = false,
}: SettingsSaveBarProps) {
  if (readOnly) return null;

  return (
    <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
      ) : null}
      <Button type="submit" loading={loading} disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  );
}
