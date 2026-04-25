import { Button, Checkbox } from "@components/ui";

import type { RoleName, RolePermissionMatrixRow } from "../types/settings.types";
import { getRoleLabel } from "../utils/roleLabels";

interface RolePermissionMatrixProps {
  roles: RoleName[];
  modules: string[];
  actions: string[];
  rows: RolePermissionMatrixRow[];
  onToggleAction: (roleName: RoleName, module: string, action: string) => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
  readOnly?: boolean;
  hasChanges?: boolean;
}

const toTitle = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function RolePermissionMatrix({
  roles,
  modules,
  actions,
  rows,
  onToggleAction,
  onSave,
  onReset,
  loading = false,
  readOnly = false,
  hasChanges = false,
}: RolePermissionMatrixProps) {
  const getActions = (roleName: RoleName, module: string) =>
    rows.find((row) => row.role_name === roleName && row.module === module)?.actions ?? [];

  return (
    <div className="space-y-6">
      {roles.map((role) => (
        <div key={role} className="space-y-3 rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold text-text-primary">{getRoleLabel(role)} Permissions</h4>
          {role === "admin" ? (
            <p className="text-xs text-text-secondary">
              Admin permissions are fixed to full access.
            </p>
          ) : null}
          <div className="space-y-2">
            {modules.map((module) => {
              const roleActions = getActions(role, module);
              const disableRowEditing = readOnly || role === "admin";
              return (
                <div
                  key={`${role}-${module}`}
                  className="grid gap-3 rounded-md border border-border/70 p-3 lg:grid-cols-[220px_1fr]"
                >
                  <div className="text-sm font-medium text-text-primary">{toTitle(module)}</div>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {actions.map((action) => (
                      <Checkbox
                        key={`${role}-${module}-${action}`}
                        checked={roleActions.includes(action)}
                        label={toTitle(action)}
                        disabled={disableRowEditing}
                        onChange={() => onToggleAction(role, module, action)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {readOnly ? null : (
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onReset} disabled={loading}>
            Reset
          </Button>
          <Button type="button" onClick={onSave} loading={loading} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
