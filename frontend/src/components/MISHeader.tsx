import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./ui";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import NotificationBellDropdown from "@/modules/notifications/components/NotificationBellDropdown";
import { useNotificationsSocket } from "@/modules/notifications/hooks/useNotificationsSocket";
import useCan from "@/hooks/useCan";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarState } from "./sidebar/useSidebarState";
import i18n from "@/utils/i18n";

export default function MISHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { userProfile, logout } = useUserStore();
  const { can } = useCan();
  const { toggleMobile } = useSidebarState();
  const canViewNotifications = can("notifications");
  useNotificationsSocket(canViewNotifications);
  const languages = [
    { code: "en", name: t("language.english"), flag: "🇬🇧" },
    { code: "da", name: t("language.dari"), flag: "🇦🇫" },
    { code: "pa", name: t("language.pashto"), flag: "🇦🇫" },
  ];
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success(t("auth.logoutSuccess", "Logged out successfully"));
    navigate("/auth/login", { replace: true });
  };

  // Get display name
  const displayName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim() ||
      userProfile.username
    : "User";

  // Get role display name
  const roleDisplay = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() +
      userProfile.role.slice(1).replace("_", " ")
    : "User";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={t("mis.header.search", "Search students, teachers...")}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {canViewNotifications ? (
          <NotificationBellDropdown
            isOpen={showNotifications}
            onToggle={() => {
              setShowNotifications((value) => !value);
              setShowProfileMenu(false);
            }}
            onClose={() => setShowNotifications(false)}
          />
        ) : null}

        <div className="relative">
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            onBlur={() => setTimeout(() => setLanguageDropdownOpen(false), 200)}
            className="flex items-center gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
            aria-label={t("language.select")}
          >
            <Globe size={20} />
            <span className="text-xs font-medium uppercase">
              {i18n.language}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                languageDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {languageDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-black/5 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setLanguageDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    i18n.language === lang.code
                      ? "bg-[#0B7A4B]/10 dark:bg-[#66BB4A]/20 text-[#0B7A4B] dark:text-[#66BB4A]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          aria-label={t("nav.toggleTheme")}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-hover"
          >
            <Avatar name={displayName} src={userProfile?.avatarUrl} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-text-primary">
                {displayName}
              </p>
              <p className="text-xs text-text-secondary">{roleDisplay}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card py-2 shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="font-medium text-text-primary">{displayName}</p>
                <p className="text-sm text-text-secondary">
                  {userProfile?.email || "user@school.edu"}
                </p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="h-4 w-4" />
                  {t("auth.profile", "Profile")}
                </Link>
                <Link
                  to="/settings"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
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
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>
  );
}
