import SidebarItem from "./SidebarItem";
import SidebarToggle from "./SidebarToggle";
import { useSidebarState } from "./useSidebarState";
import { sidebarNavigationData } from "./sidebarData";
import useCan from "@/hooks/useCan";

export function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile, toggleMobile } = useSidebarState();
  const { can } = useCan();

  const navigationItems = sidebarNavigationData.filter((item) => {
    if (item.path === "/notifications") {
      return can("notifications");
    }
    if (item.path === "/reports") {
      return can("reports");
    }
    return true;
  });

  return (
    <>
      {/* Mobile hamburger button - visible only on mobile/tablet */}
      <button
        onClick={toggleMobile}
        className={`fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg lg:hidden transition-transform duration-300 ${
          isMobileOpen ? "translate-x-64" : "translate-x-0"
        }`}
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
           left-0 top-0 z-50 h-full bg-slate-900 border-r border-white/10 transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header with logo and toggle */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-white font-semibold text-sm">BloodDonate</span>
            </div>
          )}
          {/* Desktop toggle - hidden on mobile */}
          <div className="hidden lg:block">
            <SidebarToggle />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
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

        {/* Mobile close button - visible only on mobile */}
        <button
          onClick={closeMobile}
          className="absolute -right-10 top-4 flex h-8 w-8 items-center justify-center rounded-r-lg bg-slate-800 text-white lg:hidden"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </aside>
    </>
  );
}
