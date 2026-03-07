import { PageHeader } from "@/components";

import GeneralSettingsForm from "../components/GeneralSettingsForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="General Settings" subtitle="Organization profile and platform defaults" />
      <GeneralSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
