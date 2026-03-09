import { useMemo } from "react";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import { useSettingsNavigation } from "../hooks/useSettingsNavigation";
import { useSettingsSectionAccess } from "../hooks/useSettingsSectionAccess";
import SettingsSectionCard from "../components/SettingsSectionCard";
import type { SettingsSection } from "../types/settings.types";

const descriptions: Record<SettingsSection, string> = {
  general: "Organization profile, contact points, branding and maintenance mode.",
  user_roles: "User policy controls for invites and role defaults (scaffolded).",
  notifications: "Email, SMS and in-app delivery channel configuration.",
  emergency_alerts: "Emergency escalation behavior and throttling rules (scaffolded).",
  blood_request_rules: "Blood request validation and expiry rules (scaffolded).",
  donor_eligibility: "Eligibility thresholds for donor screening (scaffolded).",
  auto_matching: "Candidate matching algorithm controls (scaffolded).",
  localization: "Language, date/time and timezone defaults.",
  security: "Authentication lockout and session controls.",
};

export default function SettingsOverviewPage() {
  const { canViewSettings, overview, isLoading } = useSettingsSectionAccess();
  const { navigateTo, items } = useSettingsNavigation();

  const pathBySection = useMemo(() => {
    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.path;
      return acc;
    }, {});
  }, [items]);

  if (!canViewSettings) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          You do not have permission to access settings.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !overview) {
    return (
      <Card>
        <CardContent>Loading settings overview...</CardContent>
      </Card>
    );
  }

  const sectionEntries = Object.values(overview.sections);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage system configuration by section"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectionEntries.map((section) => (
          <SettingsSectionCard
            key={section.section}
            title={section.title}
            description={descriptions[section.section]}
            status={section.implemented ? "Live" : "Planned"}
            onOpen={() => navigateTo(pathBySection[section.section] || "/settings")}
          />
        ))}
      </div>
    </div>
  );
}
