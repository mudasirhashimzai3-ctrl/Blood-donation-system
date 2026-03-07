import { PageHeader } from "@/components";

import EmergencyAlertSettingsForm from "../components/EmergencyAlertSettingsForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function EmergencyAlertSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Emergency Alert Settings" subtitle="Escalation and emergency dispatch controls" />
      <EmergencyAlertSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
