import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { extractAxiosError } from "@/utils/extractError";

export default function PersonalSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, updateTheme } = useTheme();
  const { currentLanguage, setLanguagePreference } = useLanguagePreference();
  const { logout, updateUserProfile, loading, userProfile } = useUserStore();
  const [language, setLanguage] = useState<string>(currentLanguage);

  const role = userProfile?.role;
  const profilePath = role === "recipient" ? "/recipient/profile" : "/donor/profile";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("personalSettings.title", "Settings")}
        subtitle={t("personalSettings.subtitle", "Manage your personal app settings")}
      />

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-base font-semibold text-text-primary">
            {t("personalSettings.language", "Language")}
          </h2>
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="da">Dari</option>
              <option value="pa">Pashto</option>
            </select>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  await setLanguagePreference(language);
                  toast.success(t("personalSettings.languageSaved", "Language updated"));
                } catch (error) {
                  toast.error(extractAxiosError(error, "Failed to update language"));
                }
              }}
            >
              {t("common.save", "Save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-base font-semibold text-text-primary">
            {t("personalSettings.theme", "Theme")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "primary" : "outline"}
              leftIcon={<Sun className="h-4 w-4" />}
              onClick={async () => {
                updateTheme("light");
                await updateUserProfile({ theme: "light" });
              }}
            >
              {t("personalSettings.light", "Light")}
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "outline"}
              leftIcon={<Moon className="h-4 w-4" />}
              onClick={async () => {
                updateTheme("dark");
                await updateUserProfile({ theme: "dark" });
              }}
            >
              {t("personalSettings.dark", "Dark")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />} onClick={() => navigate(profilePath)}>
            {t("personalSettings.profile", "Open Profile")}
          </Button>
          <Button
            variant="danger"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              logout();
              navigate("/auth/login", { replace: true });
            }}
          >
            {t("auth.logout", "Logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
