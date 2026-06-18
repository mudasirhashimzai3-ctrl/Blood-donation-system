import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useSettingsUiStore } from "../stores/useSettingsUiStore";
import type { AdminSettingsTab, SystemSettingsSection } from "../types/settings.types";

const VALID_TABS: AdminSettingsTab[] = [
  "system_settings",
  "manage_roles",
  "change_password",
];
const VALID_SECTIONS: SystemSettingsSection[] = [
  "general",
  "notifications",
  "auto_matching",
  "localization",
  "security",
  "backup_restore",
];

const parseTab = (value: string | null): AdminSettingsTab =>
  VALID_TABS.includes(value as AdminSettingsTab) ? (value as AdminSettingsTab) : "system_settings";

const parseSection = (value: string | null): SystemSettingsSection =>
  VALID_SECTIONS.includes(value as SystemSettingsSection)
    ? (value as SystemSettingsSection)
    : "general";

export const useAdminSettingsRouting = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTopTab = useSettingsUiStore((state) => state.activeTopTab);
  const activeSystemSection = useSettingsUiStore((state) => state.activeSystemSection);
  const setActiveTopTab = useSettingsUiStore((state) => state.setActiveTopTab);
  const setActiveSystemSection = useSettingsUiStore((state) => state.setActiveSystemSection);
  const hasAnyDirtyChanges = useSettingsUiStore((state) => state.hasAnyDirtyChanges);

  const tab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);
  const section = useMemo(() => parseSection(searchParams.get("section")), [searchParams]);

  useEffect(() => {
    if (activeTopTab !== tab) {
      setActiveTopTab(tab);
    }
    if (activeSystemSection !== section) {
      setActiveSystemSection(section);
    }
  }, [
    activeSystemSection,
    activeTopTab,
    section,
    setActiveSystemSection,
    setActiveTopTab,
    tab,
  ]);

  const setTab = (nextTab: AdminSettingsTab) => {
    if (nextTab === tab) return;
    if (hasAnyDirtyChanges() && !window.confirm("You have unsaved changes. Leave this section?")) return;

    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    if (nextTab !== "system_settings") {
      next.delete("section");
    } else if (!next.get("section")) {
      next.set("section", section);
    }
    setSearchParams(next, { replace: true });
  };

  const setSection = (nextSection: SystemSettingsSection) => {
    if (nextSection === section) return;
    if (hasAnyDirtyChanges() && !window.confirm("You have unsaved changes. Leave this section?")) return;

    const next = new URLSearchParams(searchParams);
    next.set("tab", "system_settings");
    next.set("section", nextSection);
    setSearchParams(next, { replace: true });
  };

  return {
    tab,
    section,
    setTab,
    setSection,
  };
};
