import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { getAccessToken } from "@/lib/api";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import {
  getHomeRouteByRole,
  normalizePublicRole,
  type PublicRole,
} from "@/modules/auth/utils/roleRouting";

interface RoleRouteProps {
  allowedRoles: PublicRole[];
  children?: React.ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const role = useUserStore((state) => state.userProfile?.role);
  const loading = useUserStore((state) => state.loading);
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const logout = useUserStore((state) => state.logout);
  const hydrationStartedRef = useRef(false);
  const normalizedRole = normalizePublicRole(role);
  const hasAccessToken = Boolean(getAccessToken());

  useEffect(() => {
    if (normalizedRole || !hasAccessToken) {
      hydrationStartedRef.current = false;
      return;
    }

    if (loading || hydrationStartedRef.current) {
      return;
    }

    hydrationStartedRef.current = true;
    fetchUserProfile().catch(() => {
      hydrationStartedRef.current = false;
      logout();
    });
  }, [fetchUserProfile, hasAccessToken, loading, logout, normalizedRole]);

  if (!normalizedRole) {
    if (hasAccessToken) {
      return (
        <div
          className="flex min-h-screen items-center justify-center bg-background"
          role="status"
          aria-label="Loading user profile"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to={getHomeRouteByRole(normalizedRole)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
