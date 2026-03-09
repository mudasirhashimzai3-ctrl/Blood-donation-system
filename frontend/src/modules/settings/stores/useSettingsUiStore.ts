import { create } from "zustand";

import type { SettingsSection } from "../types/settings.types";

type DirtyMap = Partial<Record<SettingsSection, boolean>>;
type SavedMap = Partial<Record<SettingsSection, string>>;

interface SettingsUiState {
  activeSection: SettingsSection;
  dirty: DirtyMap;
  lastSavedAt: SavedMap;
  setActiveSection: (section: SettingsSection) => void;
  setSectionDirty: (section: SettingsSection, dirty: boolean) => void;
  clearSectionDirty: (section: SettingsSection) => void;
  clearAllDirty: () => void;
  markSaved: (section: SettingsSection) => void;
  isSectionDirty: (section: SettingsSection) => boolean;
}

export const useSettingsUiStore = create<SettingsUiState>((set, get) => ({
  activeSection: "general",
  dirty: {},
  lastSavedAt: {},
  setActiveSection: (section) => set({ activeSection: section }),
  setSectionDirty: (section, dirty) =>
    set((state) => ({
      dirty: {
        ...state.dirty,
        [section]: dirty,
      },
    })),
  clearSectionDirty: (section) =>
    set((state) => ({
      dirty: {
        ...state.dirty,
        [section]: false,
      },
    })),
  clearAllDirty: () => set({ dirty: {} }),
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
}));
