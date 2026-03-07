import { useMemo } from "react";

interface DirtyStateInput {
  isDirty: boolean;
  isSaving: boolean;
}

export const useSettingsDirtyState = ({ isDirty, isSaving }: DirtyStateInput) => {
  return useMemo(
    () => ({
      showUnsavedWarning: isDirty && !isSaving,
      canSave: isDirty && !isSaving,
    }),
    [isDirty, isSaving]
  );
};
