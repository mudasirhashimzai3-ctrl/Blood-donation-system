import { PageHeader } from "@/components";

import AutoMatchingSettingsForm from "../components/AutoMatchingSettingsForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function AutoMatchingSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Auto Matching Settings" subtitle="Candidate ranking and dispatch behavior" />
      <AutoMatchingSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
