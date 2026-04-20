import { describe, expect, it } from "vitest";

import { settingsKeys } from "@/modules/settings/queries/settingsKeys";

describe("settingsKeys", () => {
  it("builds role permissions query key", () => {
    expect(settingsKeys.rolePermissions()).toEqual(["settings", "rolePermissions"]);
  });

  it("builds section query key", () => {
    expect(settingsKeys.section("security")).toEqual([
      "settings",
      "sections",
      "security",
    ]);
  });
});
