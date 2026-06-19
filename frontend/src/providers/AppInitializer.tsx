import { useEffect, useState, type ReactNode } from "react";
import apiClient from "../lib/api";
import { initializeStores } from "../utils/storeInitializer";
import { Spinner } from "../components/Loader";
import { useTheme } from "../hooks/useTheme";
import { useDirection } from "../hooks/useDirection";
import { useUserProfileStore } from "../stores/useUserStore";
import { normalizeLanguageCode } from "../utils/language";
import i18n from "../utils/i18n";

interface Props {
  children: ReactNode;
}
function AppInitializer({ children }: Props) {
  const [ready, setReady] = useState(false);
  useTheme();
  useDirection();
  const lang = useUserProfileStore((s) => s.userProfile?.preferences.language);

  useEffect(() => {
    if (!lang) {
      return;
    }

    const normalizedLanguage = normalizeLanguageCode(lang);
    if (normalizeLanguageCode(i18n.language) !== normalizedLanguage) {
      void i18n.changeLanguage(normalizedLanguage);
    }
  }, [lang]);

  useEffect(() => {
    const start = async () => {
      const initial_data = (await apiClient.get("/core/initialize")).data;
      initializeStores(initial_data);
      setReady(true);
    };
    start();
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

export default AppInitializer;
