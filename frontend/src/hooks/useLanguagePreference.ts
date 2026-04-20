import { useCallback } from "react";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import i18n from "@/utils/i18n";
import { normalizeLanguageCode } from "@/utils/language";

export const useLanguagePreference = () => {
  const userProfile = useUserStore((state) => state.userProfile);
  const updateUserProfile = useUserStore((state) => state.updateUserProfile);

  const currentLanguage = normalizeLanguageCode(
    i18n.language,
    normalizeLanguageCode(userProfile?.preferences?.language)
  );

  const setLanguagePreference = useCallback(
    async (requestedLanguage: string) => {
      const targetLanguage = normalizeLanguageCode(requestedLanguage);
      const previousLanguage = normalizeLanguageCode(
        i18n.language,
        normalizeLanguageCode(userProfile?.preferences?.language)
      );

      if (targetLanguage === previousLanguage) {
        return targetLanguage;
      }

      await i18n.changeLanguage(targetLanguage);

      try {
        if (userProfile) {
          await updateUserProfile({ language_preference: targetLanguage });
        }
      } catch (error) {
        await i18n.changeLanguage(previousLanguage);
        throw error;
      }

      return targetLanguage;
    },
    [updateUserProfile, userProfile]
  );

  return {
    currentLanguage,
    setLanguagePreference,
  };
};

