import {
  Bell,
  Building2,
  ChartColumnIncreasing,
  ClipboardCheck,
  Droplets,
  HandHeart,
  HeartPulse,
  LayoutDashboard,
  Settings,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SubNavItem } from "./useSidebarState";
import type { PublicRole } from "@/modules/auth/utils/roleRouting";

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
const adminSidebarNavigationData: SidebarItemData[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/donors", label: "Donors", icon: Users },
  { path: "/recipients", label: "Recipients", icon: HeartPulse },
  { path: "/hospitals", label: "Hospitals", icon: Building2 },
  { path: "/blood-requests", label: "Blood Requests", icon: Droplets },
  { path: "/donations", label: "Donations", icon: HandHeart },
  { path: "/reports", label: "Reports", icon: ChartColumnIncreasing },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings", label: "Settings", icon: Settings, divider: true },
  { path: "/profile", label: "Profile", icon: User },
];

const donorSidebarNavigationData: SidebarItemData[] = [
   { path: "/donor/dashboard", label: "Donor Dashboard", icon: LayoutDashboard },
   { path: "/donor/donation-actions", label: "Accept / Reject Donation", icon: UserCheck },
   { path: "/donor/donation-history", label: "Donation History", icon: HandHeart },
   { path: "/donor/notifications", label: "Notifications", icon: Bell },
   { path: "/donor/profile", label: "Profile", icon: User },
   { path: "/donor/settings", label: "Settings", icon: Settings },
 ];

const recipientSidebarNavigationData: SidebarItemData[] = [
  { path: "/recipient/dashboard", label: "Recipient Dashboard", icon: LayoutDashboard },
  { path: "/recipient/create-request", label: "Create Blood Request", icon: Droplets },
  { path: "/recipient/my-requests", label: "My Requests", icon: ClipboardCheck },
  { path: "/recipient/donor-responses", label: "Donor Responses", icon: Users },
  { path: "/recipient/notifications", label: "Notifications", icon: Bell },
  { path: "/recipient/profile", label: "Profile", icon: User },
  { path: "/recipient/settings", label: "Settings", icon: Settings },
];

export const getSidebarNavigationDataByRole = (
  role: PublicRole | null
): SidebarItemData[] => {
  if (role === "donor") return donorSidebarNavigationData;
  if (role === "recipient") return recipientSidebarNavigationData;
  return adminSidebarNavigationData;
};
