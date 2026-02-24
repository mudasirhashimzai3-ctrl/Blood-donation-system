import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthGuard } from "@/providers";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/modules/auth/index";
import NotFoundPage from "@/pages/PageNotFounded";
import { MISLayout } from "@/components";
import { Dashboard } from "@/modules/dashboard";
import { GeneralSettings, SettingsOverview, UserManagement } from "@settings/index";
import { UserProfile } from "@/modules/profile";
import { DonorCreatePage, DonorEditPage, DonorFilters, DonorForm, DonorListPage, DonorViewPage } from "@/modules/donors";

function AppRouterProvider() {
  const router = createBrowserRouter([
    // Public Website Routes (CMS)
    {
      path: "/",
      element: (
        <AuthGuard>
          <MISLayout />
        </AuthGuard>
      ),
      errorElement: <NotFoundPage />,
      children: [
        // Dashboard
        { index: true, element: <Dashboard /> },
        // Settings
        { path: "settings", element: <SettingsOverview /> },
        { path: "settings/general", element: <GeneralSettings /> },
        { path: "settings/users", element: <UserManagement /> },
        
        
        // Donors
        { path: "donors", element: <DonorListPage /> },
        { path: "donors/new", element: <DonorCreatePage/> },
        { path: "donors/:id", element: <DonorViewPage/> },
        { path: "donors/:id/edit", element: <DonorEditPage/> },

        // Profile
        { path: "profile", element: <UserProfile /> },
      ],
    },

    // MIS Auth Routes (Public)
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      path: "/auth/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/auth/reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "/auth/verify-email/:token",
      element: <VerifyEmailPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouterProvider;
