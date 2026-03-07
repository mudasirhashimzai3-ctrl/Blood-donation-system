import { useNavigate } from "react-router-dom";

import type { SettingsSection } from "../types/settings.types";

export interface SettingsNavItem {
  section: SettingsSection;
  label: string;
  path: string;
  description: string;
}

const navItems: SettingsNavItem[] = [
  {
    section: "general",
    label: "General Settings",
    path: "/settings/general",
    description: "Organization profile and maintenance mode",
  },
  {
    section: "user_roles",
    label: "User & Role Settings",
    path: "/settings/user-roles",
    description: "User invitation and role policy",
  },
  {
    section: "notifications",
    label: "Notification Settings",
    path: "/settings/notifications",
    description: "Email, SMS and in-app channels",
  },
  {
    section: "emergency_alerts",
    label: "Emergency Alerts",
    path: "/settings/emergency-alerts",
    description: "Escalation and emergency dispatch configuration",
  },
  {
    section: "blood_request_rules",
    label: "Blood Request Rules",
    path: "/settings/blood-request-rules",
    description: "Validation rules for request intake",
  },
  {
    section: "donor_eligibility",
    label: "Donor Eligibility Rules",
    path: "/settings/donor-eligibility",
    description: "Eligibility guardrails and donation gaps",
  },
  {
    section: "auto_matching",
    label: "Auto Matching Settings",
    path: "/settings/auto-matching",
    description: "Candidate ranking and retry strategy",
  },
  {
    section: "localization",
    label: "Language & Timezone",
    path: "/settings/localization",
    description: "Default language, timezone and formats",
  },
  {
    section: "security",
    label: "Security Settings",
    path: "/settings/security",
    description: "Password policy and lockout controls",
  },
];

export const useSettingsNavigation = () => {
  const navigate = useNavigate();

  return {
    navItems,
    goToSection: (section: SettingsSection) => {
      const target = navItems.find((item) => item.section === section);
      if (target) {
        navigate(target.path);
      }
    },
  };
};
