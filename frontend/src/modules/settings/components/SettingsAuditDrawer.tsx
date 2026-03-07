import { useMemo } from "react";

import { Button, Card } from "@/components/ui";
import { useSettingsAuditLogs } from "../queries/useSettingsAuditLogs";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export default function SettingsAuditDrawer() {
  const auditDrawerOpen = useSettingsUiStore((state) => state.auditDrawerOpen);
  const auditSection = useSettingsUiStore((state) => state.auditSection);
  const closeAuditDrawer = useSettingsUiStore((state) => state.closeAuditDrawer);

  const { data, isLoading } = useSettingsAuditLogs(auditSection ?? undefined);

  const rows = useMemo(() => data?.results ?? [], [data]);

  if (!auditDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={closeAuditDrawer} aria-hidden="true" />
      <div className="w-full max-w-xl overflow-y-auto bg-background p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Settings Audit Logs</h2>
          <Button variant="outline" onClick={closeAuditDrawer}>
            Close
          </Button>
        </div>
        <div className="space-y-3">
          {isLoading ? <p className="text-sm text-text-secondary">Loading audit logs...</p> : null}
          {!isLoading && rows.length === 0 ? (
            <p className="text-sm text-text-secondary">No audit entries found.</p>
          ) : null}
          {rows.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium text-text-primary">
                  {row.section} {row.reset_to_default ? "(reset)" : "(update)"}
                </p>
                <p className="text-text-secondary">By: {row.changed_by_name ?? "system"}</p>
                <p className="text-text-secondary">At: {new Date(row.created_at).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
