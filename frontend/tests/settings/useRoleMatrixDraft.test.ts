import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRoleMatrixDraft } from "@/modules/settings/hooks/useRoleMatrixDraft";
import type { RolePermissionMatrixRow } from "@/modules/settings/types/settings.types";

const initialRows: RolePermissionMatrixRow[] = [
  {
    role_name: "admin",
    module: "settings",
    actions: ["view", "change"],
  },
  {
    role_name: "receptionist",
    module: "settings",
    actions: ["view"],
  },
];

describe("useRoleMatrixDraft", () => {
  it("toggles matrix action and detects changes", () => {
    const { result } = renderHook(() => useRoleMatrixDraft(initialRows));
    expect(result.current.hasChanges).toBe(false);

    act(() => {
      result.current.toggleAction("admin", "settings", "delete");
    });
    expect(result.current.hasChanges).toBe(true);
  });

  it("resets draft rows to initial matrix", () => {
    const { result } = renderHook(() => useRoleMatrixDraft(initialRows));
    act(() => {
      result.current.toggleAction("admin", "settings", "delete");
    });
    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.hasChanges).toBe(false);
  });
});
