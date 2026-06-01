import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthGuard } from "@/providers";
import RoleRoute from "@/providers/RoleRoute";
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/modules/auth/index";
import NotFoundPage from "@/pages/PageNotFounded";
import { MISLayout } from "@/components";
// import { GeneralSettings, SettingsOverview, UserManagement } from "@settings/index";
import { UserProfile } from "@/modules/profile";
import { ReportsWorkspacePage } from "@/modules/reports";
import { DonorCreatePage, DonorEditPage, DonorListPage, DonorViewPage } from "@/modules/donors";
import { HospitalCreatePage, HospitalEditPage, HospitalListPage, HospitalViewPage } from "@/modules/hospitals";
import { RecipientCreatePage, RecipientEditPage, RecipientListPage, RecipientViewPage } from "@/modules/recipients";
import {
  BloodRequestCreatePage,
  BloodRequestEditPage,
  BloodRequestListPage,
  BloodRequestViewPage,
} from "@/modules/blood-requests";
import { DonationListPage, DonationViewPage } from "@/modules/donations";
import { NotificationListPage, NotificationViewPage } from "@/modules/notifications";
import { AdminSettingsPage } from "@/modules/settings";
import { AdminDashboardPage } from "@/modules/dashboard";
import {
  DonorDashboardPage,
  DonorDonationActionsPage,
  DonorDonationHistoryPage,
  DonorNearbyRequestsPage,
  PersonalSettingsPage,
  RecipientCreateRequestPage,
  RecipientDashboardPage,
  RecipientDonorResponsesPage,
  RecipientMyRequestsPage,
} from "@/modules/role-access";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { getHomeRouteByRole } from "@/modules/auth/utils/roleRouting";

function RoleHomeRedirect() {
  const role = useUserStore((state) => state.userProfile?.role);
  return <Navigate to={getHomeRouteByRole(role)} replace />;
}

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
        // Dashboard - Redirect by role
        { index: true, element: <RoleHomeRedirect /> },

        // Admin-only panel routes
        {
          element: <RoleRoute allowedRoles={["admin"]} />,
          children: [
            // Settings
            { path: "dashboard", element: <AdminDashboardPage /> },
            { path: "settings", element: <AdminSettingsPage /> },
            { path: "settings/general", element: <Navigate to="/settings?tab=system_settings&section=general" replace /> },
            {
              path: "settings/notifications",
              element: <Navigate to="/settings?tab=system_settings&section=notifications" replace />,
            },
            {
              path: "settings/localization",
              element: <Navigate to="/settings?tab=system_settings&section=localization" replace />,
            },
            { path: "settings/security", element: <Navigate to="/settings?tab=system_settings&section=security" replace /> },
            { path: "settings/user-roles", element: <Navigate to="/settings?tab=manage_roles" replace /> },
            { path: "settings/emergency-alerts", element: <Navigate to="/settings?tab=system_settings&section=general" replace /> },
            {
              path: "settings/blood-request-rules",
              element: <Navigate to="/settings?tab=system_settings&section=general" replace />,
            },
            {
              path: "settings/donor-eligibility",
              element: <Navigate to="/settings?tab=system_settings&section=general" replace />,
            },
            { path: "settings/auto-matching", element: <Navigate to="/settings?tab=system_settings&section=auto_matching" replace /> },

            // Admin management views
            { path: "donors", element: <DonorListPage /> },
            { path: "donors/new", element: <DonorCreatePage /> },
            { path: "donors/:id", element: <DonorViewPage /> },
            { path: "donors/:id/edit", element: <DonorEditPage /> },

            { path: "recipients", element: <RecipientListPage /> },
            { path: "recipients/new", element: <RecipientCreatePage /> },
            { path: "recipients/:id", element: <RecipientViewPage /> },
            { path: "recipients/:id/edit", element: <RecipientEditPage /> },

            { path: "hospitals", element: <HospitalListPage /> },
            { path: "hospitals/new", element: <HospitalCreatePage /> },
            { path: "hospitals/:id", element: <HospitalViewPage /> },
            { path: "hospitals/:id/edit", element: <HospitalEditPage /> },

            { path: "reports", element: <ReportsWorkspacePage /> },
          ],
        },

        // Shared operational routes (role + permission filtered inside pages/backend)
        { path: "blood-requests", element: <BloodRequestListPage /> },
        { path: "blood-requests/new", element: <BloodRequestCreatePage /> },
        { path: "blood-requests/:id", element: <BloodRequestViewPage /> },
        { path: "blood-requests/:id/edit", element: <BloodRequestEditPage /> },
        { path: "donations", element: <DonationListPage /> },
        { path: "donations/:id", element: <DonationViewPage /> },
        { path: "notifications", element: <NotificationListPage /> },
        { path: "notifications/:id", element: <NotificationViewPage /> },
        { path: "profile", element: <UserProfile /> },

        // Donor dedicated routes
{
           element: <RoleRoute allowedRoles={["donor"]} />,
           children: [
             { path: "donor/dashboard", element: <DonorDashboardPage /> },
             { path: "donor/nearby-requests", element: <DonorNearbyRequestsPage /> },
             { path: "donor/donation-actions", element: <DonorDonationActionsPage /> },
             { path: "donor/donation-history", element: <DonorDonationHistoryPage /> },
             { path: "donor/donation-actions/:id", element: <DonationViewPage /> },
             { path: "donor/donation-history/:id", element: <DonationViewPage /> },
             { path: "donor/notifications", element: <NotificationListPage /> },
             { path: "donor/notifications/:id", element: <NotificationViewPage /> },
             { path: "donor/profile", element: <UserProfile /> },
             { path: "donor/settings", element: <PersonalSettingsPage /> },
           ],
         },

        // Recipient dedicated routes
        {
          element: <RoleRoute allowedRoles={["recipient"]} />,
          children: [
            { path: "recipient/dashboard", element: <RecipientDashboardPage /> },
            { path: "recipient/create-request", element: <RecipientCreateRequestPage /> },
            { path: "recipient/my-requests", element: <RecipientMyRequestsPage /> },
            { path: "recipient/my-requests/:id", element: <BloodRequestViewPage /> },
            { path: "recipient/my-requests/:id/edit", element: <BloodRequestEditPage /> },
            { path: "recipient/donor-responses", element: <RecipientDonorResponsesPage /> },
            { path: "recipient/notifications", element: <NotificationListPage /> },
            { path: "recipient/notifications/:id", element: <NotificationViewPage /> },
            { path: "recipient/profile", element: <UserProfile /> },
            { path: "recipient/settings", element: <PersonalSettingsPage /> },
          ],
        },
      ],
    },

    // MIS Auth Routes (Public)
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      path: "/auth/signup",
      element: <SignupPage />,
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
