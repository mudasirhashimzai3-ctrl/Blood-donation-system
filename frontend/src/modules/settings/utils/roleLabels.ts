import type { RoleName } from "../types/settings.types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  recipient: "Recipient",
  donor: "Donor",
  receptionist: "Recipient",
  viewer: "Donor",
};

export const getRoleLabel = (role: RoleName | string): string => ROLE_LABELS[role] ?? role;
