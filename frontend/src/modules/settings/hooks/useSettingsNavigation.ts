import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useSettingsUiStore } from "../stores/useSettingsUiStore";
import type { SettingsSection } from "../types/settings.types";

export interface SettingsNavItem {
  key: SettingsSection;
  label: string;
  path: string;
  live: boolean;
}

const sectionItems: SettingsNavItem[] = [
  { key: "general", label: "General", path: "/settings/general", live: true },
  { key: "user_roles", label: "User & Roles", path: "/settings/user-roles", live: false },
  { key: "notifications", label: "Notifications", path: "/settings/notifications", live: true },
  { key: "emergency_alerts", label: "Emergency Alerts", path: "/settings/emergency-alerts", live: false },
  { key: "blood_request_rules", label: "Blood Request Rules", path: "/settings/blood-request-rules", live: false },
  { key: "donor_eligibility", label: "Donor Eligibility", path: "/settings/donor-eligibility", live: false },
  { key: "auto_matching", label: "Auto Matching", path: "/settings/auto-matching", live: false },
  { key: "localization", label: "Language & Timezone", path: "/settings/localization", live: true },
  { key: "security", label: "Security", path: "/settings/security", live: true },
];

export const useSettingsNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dirty = useSettingsUiStore((state) => state.dirty);

  const hasUnsavedChanges = useMemo(() => Object.values(dirty).some(Boolean), [dirty]);

  const navigateTo = (path: string) => {
    if (location.pathname === path) return;

    if (hasUnsavedChanges) {
      const proceed = window.confirm("You have unsaved changes. Leave this page?");
      if (!proceed) return;
    }

    navigate(path);
  };

  return {
    items: sectionItems,
    hasUnsavedChanges,
    navigateTo,
  };
};
