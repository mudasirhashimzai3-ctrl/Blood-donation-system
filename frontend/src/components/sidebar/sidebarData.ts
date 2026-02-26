import { HeartPulse, LayoutDashboard, Settings, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SubNavItem } from "./useSidebarState";

export interface SidebarItemData {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  subItems?: SubNavItem[];
  divider?: boolean;
}

/**
 * Sidebar Navigation Data
 * Separated from UI to allow easier management and customization
 */
export const sidebarNavigationData: SidebarItemData[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/donors",
    label: "Donors",
    icon: Users,
  },
  {
    path: "/recipients",
    label: "Recipients",
    icon: HeartPulse,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
  },
];
