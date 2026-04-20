import { create } from "zustand";

import type {
  AdminSettingsTab,
  SettingsSection,
  SystemSettingsSection,
} from "../types/settings.types";

type DirtyMap = Partial<Record<SettingsSection, boolean>>;
type SavedMap = Partial<Record<SettingsSection, string>>;
type TopTabDirtyMap = Partial<Record<AdminSettingsTab, boolean>>;

interface SettingsUiState {
  activeSection: SettingsSection;
  activeTopTab: AdminSettingsTab;
  activeSystemSection: SystemSettingsSection;
  dirty: DirtyMap;
  topTabDirty: TopTabDirtyMap;
  lastSavedAt: SavedMap;
  setActiveSection: (section: SettingsSection) => void;
  setActiveTopTab: (tab: AdminSettingsTab) => void;
  setActiveSystemSection: (section: SystemSettingsSection) => void;
  setSectionDirty: (section: SettingsSection, dirty: boolean) => void;
  setTopTabDirty: (tab: AdminSettingsTab, dirty: boolean) => void;
  clearSectionDirty: (section: SettingsSection) => void;
  clearAllDirty: () => void;
  markSaved: (section: SettingsSection) => void;
  isSectionDirty: (section: SettingsSection) => boolean;
  isTopTabDirty: (tab: AdminSettingsTab) => boolean;
  hasAnyDirtyChanges: () => boolean;
}

export const useSettingsUiStore = create<SettingsUiState>((set, get) => ({
  activeSection: "general",
  activeTopTab: "system_settings",
  activeSystemSection: "general",
  dirty: {},
  topTabDirty: {},
  lastSavedAt: {},
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveTopTab: (tab) => set({ activeTopTab: tab }),
  setActiveSystemSection: (section) => set({ activeSystemSection: section }),
  setSectionDirty: (section, dirty) =>
    set((state) => ({
      dirty: {
        ...state.dirty,
        [section]: dirty,
      },
    })),
  setTopTabDirty: (tab, dirty) =>
    set((state) => ({
      topTabDirty: {
        ...state.topTabDirty,
        [tab]: dirty,
      },
    })),
  clearSectionDirty: (section) =>
    set((state) => ({
      dirty: {
        ...state.dirty,
        [section]: false,
      },
    })),
  clearAllDirty: () => set({ dirty: {}, topTabDirty: {} }),
  markSaved: (section) =>
    set((state) => ({
      lastSavedAt: {
        ...state.lastSavedAt,
        [section]: new Date().toISOString(),
      },
      dirty: {
        ...state.dirty,
        [section]: false,
      },
    })),
  isSectionDirty: (section) => Boolean(get().dirty[section]),
  isTopTabDirty: (tab) => Boolean(get().topTabDirty[tab]),
  hasAnyDirtyChanges: () => {
    const state = get();
    return [...Object.values(state.dirty), ...Object.values(state.topTabDirty)].some(Boolean);
  },
}));
