import { Button } from "@/components/ui";

interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset?: () => void;
  onViewAudit?: () => void;
}

export default function SettingsSaveBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
  onViewAudit,
}: SettingsSaveBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
      {onViewAudit ? (
        <Button variant="outline" type="button" onClick={onViewAudit}>
          View Audit
        </Button>
      ) : null}
      {onReset ? (
        <Button variant="outline" type="button" onClick={onReset}>
          Reset Defaults
        </Button>
      ) : null}
      <Button type="button" onClick={onSave} loading={isSaving} disabled={!isDirty}>
        Save Changes
      </Button>
    </div>
  );
}
