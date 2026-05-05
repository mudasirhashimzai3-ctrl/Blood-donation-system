import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import ManageRolesPolicyForm from "@/modules/settings/components/ManageRolesPolicyForm";
import RolePermissionMatrix from "@/modules/settings/components/RolePermissionMatrix";
import type { UserRolePolicyFormValues } from "@/modules/settings/schemas/userRolePolicy.schema";

vi.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}));

function ManageRolesPolicyFormHarness() {
  const form = useForm<UserRolePolicyFormValues>({
    defaultValues: {
      allow_user_invite: true,
      allow_role_editing: false,
      allow_self_profile_edit: true,
      enforce_2fa_for_admin: false,
    },
  });

  return <ManageRolesPolicyForm form={form} onSubmit={vi.fn()} />;
}

describe("settings role label mapping", () => {
  it("renders donor/recipient/admin labels in role permission matrix", () => {
    render(
      <RolePermissionMatrix
        roles={["donor", "recipient", "admin"]}
        modules={["settings"]}
        actions={["view"]}
        rows={[
          { role_name: "donor", module: "settings", actions: ["view"] },
          { role_name: "recipient", module: "settings", actions: ["view"] },
          { role_name: "admin", module: "settings", actions: ["view"] },
        ]}
        onToggleAction={vi.fn()}
        onSave={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Donor Permissions")).toBeInTheDocument();
    expect(screen.getByText("Recipient Permissions")).toBeInTheDocument();
    expect(screen.getByText("Admin Permissions")).toBeInTheDocument();
  });
});
