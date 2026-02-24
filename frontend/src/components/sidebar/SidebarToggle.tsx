import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebarState } from "./useSidebarState";

interface SidebarToggleProps {
  className?: string;
}

/**
 * Sidebar Toggle Button
 * Toggles sidebar collapsed/expanded state on desktop
 * On mobile, this button is not shown (handled by mobile hamburger)
 */
export default function SidebarToggle({ className = "" }: SidebarToggleProps) {
  const { isCollapsed, toggleCollapse, closeMobile } = useSidebarState();

  const handleToggle = () => {
    // On mobile, close the mobile sidebar
    closeMobile();
    // On desktop, toggle collapse
    toggleCollapse();
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 ${className}`}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </button>
  );
}
