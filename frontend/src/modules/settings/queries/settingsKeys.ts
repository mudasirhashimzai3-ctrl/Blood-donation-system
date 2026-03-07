import type { SettingsSection } from "../types/settings.types";

export const settingsKeys = {
  all: ["settings"] as const,
  section: (section: SettingsSection) => [...settingsKeys.all, "section", section] as const,
  auditLogs: (section?: SettingsSection) => [...settingsKeys.all, "audit-logs", section] as const,
};
