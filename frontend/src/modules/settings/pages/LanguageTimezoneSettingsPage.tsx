import { PageHeader } from "@/components";

import LanguageTimezoneSettingsForm from "../components/LanguageTimezoneSettingsForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function LanguageTimezoneSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Language & Timezone Settings" subtitle="Localization and display preferences" />
      <LanguageTimezoneSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
