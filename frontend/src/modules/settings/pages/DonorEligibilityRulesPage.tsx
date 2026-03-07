import { PageHeader } from "@/components";

import DonorEligibilityRulesForm from "../components/DonorEligibilityRulesForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function DonorEligibilityRulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Donor Eligibility Rules" subtitle="Minimum criteria and exclusion windows" />
      <DonorEligibilityRulesForm />
      <SettingsAuditDrawer />
    </div>
  );
}
