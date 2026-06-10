// import { ConfirmDialog } from "primereact/confirmdialog";
import AppRouterProvider from "./providers/AppRouterProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "./providers/ToastProvider";
import ErrorBoundary from "./providers/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { getDirectionForLanguage, normalizeLanguageCode } from "./utils/language";

function App() {
  const { i18n } = useTranslation();
  const preferredLanguage = useUserStore((state) => state.userProfile?.preferences?.language);

  useEffect(() => {
    if (!preferredLanguage) {
      return;
    }

    const normalizedPreferred = normalizeLanguageCode(preferredLanguage);
    const normalizedCurrent = normalizeLanguageCode(i18n.language, normalizedPreferred);

    if (normalizedCurrent !== normalizedPreferred) {
      void i18n.changeLanguage(normalizedPreferred);
    }
  }, [i18n, preferredLanguage]);

  useEffect(() => {
    const lang = normalizeLanguageCode(i18n.language);
    const dir = getDirectionForLanguage(lang);

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.language]);
  return (
   
    <ErrorBoundary>
      
      <QueryProvider>
        <AppRouterProvider />
        <ToastProvider />
        {/* <ConfirmDialog />/ */}
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
