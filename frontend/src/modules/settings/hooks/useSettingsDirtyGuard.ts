import { useEffect } from "react";

import type { SettingsSection } from "../types/settings.types";
import { useSettingsUiStore } from "../stores/useSettingsUiStore";

export const useSettingsDirtyGuard = (section: SettingsSection, isDirty: boolean) => {
  const setSectionDirty = useSettingsUiStore((state) => state.setSectionDirty);

  useEffect(() => {
    setSectionDirty(section, isDirty);
  }, [isDirty, section, setSectionDirty]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
};
