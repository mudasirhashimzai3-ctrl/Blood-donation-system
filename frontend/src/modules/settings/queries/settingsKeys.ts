import type { SettingsSection } from "../types/settings.types";

export const settingsKeys = {
  all: ["settings"] as const,
  overview: () => [...settingsKeys.all, "overview"] as const,
  sections: () => [...settingsKeys.all, "sections"] as const,
  section: (section: SettingsSection) => [...settingsKeys.sections(), section] as const,
  audit: () => [...settingsKeys.all, "audit"] as const,
  auditList: (params?: Record<string, unknown>) => [...settingsKeys.audit(), params] as const,
};
