import { PageHeader } from "@/components";

import BloodRequestRulesForm from "../components/BloodRequestRulesForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function BloodRequestRulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Blood Request Rules" subtitle="Intake policy and validation constraints" />
      <BloodRequestRulesForm />
      <SettingsAuditDrawer />
    </div>
  );
}
