import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";

import PlannedSectionPanel from "../components/PlannedSectionPanel";
import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";

export default function BloodRequestRulesPage() {
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
        title="Blood Request Rules"
        subtitle="Validation and lifecycle controls for blood requests"
      />
      <SettingsSectionNav />
      <PlannedSectionPanel title="Blood Request Rules" />
    </div>
  );
}
