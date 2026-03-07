import { PageHeader } from "@/components";

import SettingsAuditDrawer from "../components/SettingsAuditDrawer";
import UserRoleSettingsForm from "../components/UserRoleSettingsForm";

export default function UserRoleSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="User & Role Settings" subtitle="Role defaults, invite and profile policy" />
      <UserRoleSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
