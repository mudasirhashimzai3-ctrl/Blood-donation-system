import { useEffect } from "react";
import { HeartPulse, X } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarToggle from "./SidebarToggle";
import { useSidebarState } from "./useSidebarState";
import { sidebarNavigationData } from "./sidebarData";
import useCan from "@/hooks/useCan";

export function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebarState();
  const { can } = useCan();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobile();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeMobile]);

  const navigationItems = sidebarNavigationData.filter((item) => {
    if (item.path === "/notifications") {
      return can("notifications");
    }
    if (item.path === "/reports") {
      return can("reports");
    }
    if (item.path === "/settings") {
      return can("settings");
    }
    return true;
  });

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobile}
          aria-label="Close sidebar backdrop"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-border/90 bg-[linear-gradient(135deg,rgba(249,226,231,0.97)_0%,rgba(230,235,250,0.96)_50%,rgba(219,242,236,0.95)_100%)] shadow-[0_24px_48px_-20px_rgba(15,23,42,0.55)] backdrop-blur transition-all duration-300 dark:bg-[linear-gradient(135deg,rgba(7,14,27,0.995)_0%,rgba(11,24,44,0.985)_52%,rgba(16,38,66,0.97)_100%)] lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          isCollapsed ? "w-25" : "w-67"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/90 px-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm shadow-primary/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  Blood Donation
                </p>
                <p className="truncate text-xs text-text-secondary">
                  Management System
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarToggle className="hidden lg:inline-flex" />
          </div>
        </div>

        <nav className="sidebar-scrollbar flex-1 overflow-y-auto px-3 py-4">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
              Navigation
            </p>
          )}

          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                subItems={item.subItems}
                divider={item.divider}
              />
            ))}
          </ul>
        </nav>

      </aside>
    </>
  );
}
