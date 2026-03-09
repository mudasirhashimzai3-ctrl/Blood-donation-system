import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";

import PlannedSectionPanel from "../components/PlannedSectionPanel";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";

export default function AutoMatchingSettingsPage() {
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
        title="Auto Matching Settings"
        subtitle="Automatic donor candidate matching controls"
      />
      <SettingsSectionNav />
      <PlannedSectionPanel title="Auto Matching Settings" />
    </div>
  );
}
