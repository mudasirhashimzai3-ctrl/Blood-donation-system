import { describe, expect, it } from "vitest";

import { changePasswordSchema } from "@/modules/settings/schemas/changePassword.schema";
import { rolePermissionMatrixSchema } from "@/modules/settings/schemas/rolePermissionMatrix.schema";

describe("settingsSchemas", () => {
  it("validates change password payload", () => {
    const parsed = changePasswordSchema.parse({
      old_password: "OldPass123!",
      new_password: "NewPass123!",
      confirm_password: "NewPass123!",
    });

    expect(parsed.new_password).toBe("NewPass123!");
  });

  it("rejects mismatched password confirmation", () => {
    const result = changePasswordSchema.safeParse({
      old_password: "OldPass123!",
      new_password: "NewPass123!",
      confirm_password: "NoMatch123!",
    });

    expect(result.success).toBe(false);
  });

  it("validates role permission matrix payload", () => {
    const parsed = rolePermissionMatrixSchema.parse({
      matrix: [
        {
          role_name: "admin",
          module: "settings",
          actions: ["view", "change"],
        },
      ],
    });

    expect(parsed.matrix[0].module).toBe("settings");
  });
});
