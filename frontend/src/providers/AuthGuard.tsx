import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children?: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const userProfile = useUserStore((state) => state.userProfile);
  const logout = useUserStore((state) => state.logout);
  const location = useLocation();
  const nonAdminAuthenticated = isAuthenticated && userProfile?.role !== "admin";

  useEffect(() => {
    if (nonAdminAuthenticated) {
      logout();
    }
  }, [logout, nonAdminAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (nonAdminAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Render children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
