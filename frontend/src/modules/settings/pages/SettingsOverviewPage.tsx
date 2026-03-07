import { Settings2 } from "lucide-react";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@/components/ui";
import { useSettingsNavigation } from "../hooks/useSettingsNavigation";

export default function SettingsOverviewPage() {
  const { navItems, goToSection } = useSettingsNavigation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="System configuration and policy management"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {navItems.map((item) => (
          <Card key={item.section} hover onClick={() => goToSection(item.section)}>
            <CardContent>
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Settings2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">{item.label}</h3>
              <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
