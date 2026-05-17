export type PublicRole = "admin" | "donor" | "recipient";

const isPublicRole = (role?: string | null): role is PublicRole =>
  role === "admin" || role === "donor" || role === "recipient";

export const normalizePublicRole = (role?: string | null): PublicRole | null => {
  if (!role) return null;
  return isPublicRole(role) ? role : null;
};

export const getHomeRouteByRole = (role?: string | null): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "donor") return "/donor/dashboard";
  if (normalized === "recipient") return "/recipient/dashboard";
  return "/settings";
};

export const getProfileRouteByRole = (role?: string | null): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "donor") return "/donor/profile";
  if (normalized === "recipient") return "/recipient/profile";
  return "/profile";
};

export const getSettingsRouteByRole = (role?: string | null): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "donor") return "/donor/settings";
  if (normalized === "recipient") return "/recipient/settings";
  return "/settings";
};

export const getNotificationsRouteByRole = (role?: string | null): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "donor") return "/donor/notifications";
  if (normalized === "recipient") return "/recipient/notifications";
  return "/notifications";
};

export const getBloodRequestsRouteByRole = (role?: string | null): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "recipient") return "/recipient/my-requests";
  return "/blood-requests";
};

export const getCreateBloodRequestRouteByRole = (
  role?: string | null,
  options?: { emergency?: boolean }
): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "recipient") {
    return options?.emergency
      ? "/recipient/emergency-request"
      : "/recipient/create-request";
  }
  return "/blood-requests/new";
};

export const getDonationsRouteByRole = (
  role?: string | null,
  options?: { history?: boolean }
): string => {
  const normalized = normalizePublicRole(role);
  if (normalized === "donor") {
    return options?.history ? "/donor/donation-history" : "/donor/donation-actions";
  }
  return "/donations";
};
