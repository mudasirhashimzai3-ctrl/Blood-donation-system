import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SettingsSection } from "../types/settings.types";

interface SettingsUiState {
  activeSection: SettingsSection | null;
  auditSection: SettingsSection | null;
  auditDrawerOpen: boolean;
  setActiveSection: (section: SettingsSection | null) => void;
  openAuditDrawer: (section?: SettingsSection) => void;
  closeAuditDrawer: () => void;
}

export const useSettingsUiStore = create<SettingsUiState>()(
  persist(
    (set) => ({
      activeSection: null,
      auditSection: null,
      auditDrawerOpen: false,
      setActiveSection: (section) => set({ activeSection: section }),
      openAuditDrawer: (section) =>
        set({ auditDrawerOpen: true, auditSection: section ?? null }),
      closeAuditDrawer: () => set({ auditDrawerOpen: false }),
    }),
    {
      name: "settings-ui-state",
      partialize: (state) => ({ activeSection: state.activeSection }),
    }
  )
);
