import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";

import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";

export default function EmergencyAlertSettingsPage() {
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
        title="Emergency Alert Settings"
        subtitle="Escalation and broadcast rules for emergency situations"
      />
      <SettingsSectionNav />
    </div>
  );
}
