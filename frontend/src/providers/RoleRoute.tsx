import { Navigate, Outlet } from "react-router-dom";

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
  const normalizedRole = normalizePublicRole(role);

  if (!normalizedRole) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to={getHomeRouteByRole(normalizedRole)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
