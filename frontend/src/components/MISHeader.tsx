import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./ui";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import NotificationBellDropdown from "@/modules/notifications/components/NotificationBellDropdown";
import { useNotificationsSocket } from "@/modules/notifications/hooks/useNotificationsSocket";
import useCan from "@/hooks/useCan";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarState } from "./sidebar/useSidebarState";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { extractAxiosError } from "@/utils/extractError";
import {
  getProfileRouteByRole,
  getSettingsRouteByRole,
} from "@/modules/auth/utils/roleRouting";

export default function MISHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const { userProfile, logout } = useUserStore();
  const { can } = useCan();
  const { toggleMobile } = useSidebarState();
  const canViewNotifications = can("notifications");
  useNotificationsSocket(canViewNotifications);
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, setLanguagePreference } = useLanguagePreference();

  const languages = useMemo(
    () => [
      { code: "en", name: t("language.english", "English") },
      { code: "da", name: t("language.dari", "Dari") },
      { code: "pa", name: t("language.pashto", "Pashto") },
    ],
    [t]
  );

  const iconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-text-secondary transition-colors hover:border-border hover:bg-surface-hover hover:text-text-primary";

  const handleLogout = () => {
    logout();
    toast.success(t("auth.logoutSuccess", "Logged out successfully"));
    navigate("/auth/login", { replace: true });
  };

  const displayName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim() ||
      userProfile.username
    : "User";

  const roleDisplay = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() +
      userProfile.role.slice(1).replace("_", " ")
    : "User";
  const profileRoute = getProfileRouteByRole(userProfile?.role);
  const settingsRoute = getSettingsRouteByRole(userProfile?.role);

  return (
    <header className="sticky top-0 z-30 border-b border-border/90 bg-[linear-gradient(135deg,rgba(249,226,231,0.97)_0%,rgba(230,235,250,0.96)_50%,rgba(219,242,236,0.95)_100%)] shadow-[0_14px_32px_-26px_rgba(15,23,42,0.75)] backdrop-blur dark:bg-[linear-gradient(135deg,rgba(7,14,27,0.995)_0%,rgba(11,24,44,0.985)_52%,rgba(16,38,66,0.97)_100%)]">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={toggleMobile}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t("mis.header.search", "Search")}
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {canViewNotifications ? (
            <NotificationBellDropdown
              isOpen={showNotifications}
              onToggle={() => {
                setShowNotifications((current) => !current);
                setShowProfileMenu(false);
                setLanguageDropdownOpen(false);
              }}
              onClose={() => setShowNotifications(false)}
            />
          ) : null}

          <div className="relative">
            <button
              onClick={() => {
                setLanguageDropdownOpen((current) => !current);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-transparent px-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:bg-surface-hover hover:text-text-primary"
              aria-label={t("language.select", "Select language")}
              aria-haspopup="menu"
              aria-expanded={languageDropdownOpen}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {currentLanguage}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  languageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {languageDropdownOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-44 rounded-xl border border-border bg-card p-1.5 shadow-[0_22px_38px_-26px_rgba(15,23,42,0.8)]">
                {languages.map((lang) => {
                  const isActiveLanguage = currentLanguage === lang.code;

                  return (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        try {
                          await setLanguagePreference(lang.code);
                        } catch (error) {
                          toast.error(extractAxiosError(error, t("language.updateFailed", "Failed to update language")));
                        } finally {
                          setLanguageDropdownOpen(false);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActiveLanguage
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-text-secondary hover:bg-surface hover:text-text-primary"
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {lang.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            onClick={toggleTheme}
            className={iconButtonClass}
            aria-label={t("nav.toggleTheme", "Toggle theme")}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu((current) => !current);
                setShowNotifications(false);
                setLanguageDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-surface-hover"
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
            >
              <Avatar name={displayName} src={userProfile?.avatarUrl} size="sm" />
              <div className="hidden text-left md:block">
                <p className="max-w-32 truncate text-sm font-medium text-text-primary">
                  {displayName}
                </p>
                <p className="text-xs text-text-secondary">{roleDisplay}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {showProfileMenu ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-border bg-card py-2 shadow-[0_22px_38px_-26px_rgba(15,23,42,0.8)]">
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    {userProfile?.email || "user@school.edu"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to={profileRoute}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    {t("auth.profile", "Profile")}
                  </Link>
                  <Link
                    to={settingsRoute}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {t("auth.settings", "Settings")}
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error transition-colors hover:bg-error-soft"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout", "Logout")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showNotifications || showProfileMenu || languageDropdownOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
            setLanguageDropdownOpen(false);
          }}
          aria-label="Close menus"
        />
      ) : null}
    </header>
  );
}
