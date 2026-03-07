import { PageHeader } from "@/components";

import NotificationSettingsForm from "../components/NotificationSettingsForm";
import SettingsAuditDrawer from "../components/SettingsAuditDrawer";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notification Settings" subtitle="Email, SMS and in-app delivery configuration" />
      <NotificationSettingsForm />
      <SettingsAuditDrawer />
    </div>
  );
}
