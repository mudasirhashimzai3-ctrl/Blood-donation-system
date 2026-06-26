import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";

import SettingsSectionNav from "../components/SettingsSectionNav";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";

export default function DonorEligibilityRulesPage() {
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
        title="Donor Eligibility Rules"
        subtitle="Eligibility thresholds and donation-gap policies"
      />
      <SettingsSectionNav />
    </div>
  );
}
