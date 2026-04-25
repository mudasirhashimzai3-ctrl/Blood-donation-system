import { useEffect, useMemo, useState } from "react";

import type { RoleName, RolePermissionMatrixRow } from "../types/settings.types";

const normalize = (rows: RolePermissionMatrixRow[]) =>
  rows
    .map((row) => ({
      role_name: row.role_name,
      module: row.module,
      actions: [...new Set(row.actions)].sort(),
    }))
    .sort((a, b) =>
      `${a.role_name}:${a.module}`.localeCompare(`${b.role_name}:${b.module}`)
    );

export const useRoleMatrixDraft = (initialRows: RolePermissionMatrixRow[]) => {
  const [draftRows, setDraftRows] = useState<RolePermissionMatrixRow[]>(() =>
    normalize(initialRows)
  );

  useEffect(() => {
    setDraftRows(normalize(initialRows));
  }, [initialRows]);

  const initialSignature = useMemo(
    () => JSON.stringify(normalize(initialRows)),
    [initialRows]
  );
  const draftSignature = useMemo(() => JSON.stringify(normalize(draftRows)), [draftRows]);

  const hasChanges = initialSignature !== draftSignature;

  const toggleAction = (roleName: RoleName, module: string, action: string) => {
    setDraftRows((current) => {
      const next = normalize(current);
      const index = next.findIndex(
        (row) => row.role_name === roleName && row.module === module
      );
      if (index < 0) {
        return normalize([
          ...next,
          {
            role_name: roleName,
            module,
            actions: [action],
          },
        ]);
      }

      const actions = new Set(next[index].actions);
      if (actions.has(action)) {
        actions.delete(action);
      } else {
        actions.add(action);
      }
      next[index] = {
        ...next[index],
        actions: Array.from(actions).sort(),
      };
      return next;
    });
  };

  const reset = () => {
    setDraftRows(normalize(initialRows));
  };

  return {
    draftRows,
    setDraftRows,
    hasChanges,
    toggleAction,
    reset,
  };
};
