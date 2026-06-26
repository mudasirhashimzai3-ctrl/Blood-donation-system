import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";

import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";

export default function UserRoleSettingsPage() {
  const { canViewSettings } = useSettingsSectionAccess();

  if (!canViewSettings) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          You do not have permission to access settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Management Settings"
        subtitle="Policy-level controls for user and role workflows"
      />
      <SettingsSectionNav />
    </div>
  );
}
