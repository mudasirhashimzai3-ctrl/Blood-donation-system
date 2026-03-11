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
        // { path: "settings", element: <SettingsOverview /> },
        // { path: "settings/general", element: <GeneralSettings /> },
        // { path: "settings/users", element: <UserManagement /> },
        
        
        // Donors
        { path: "donors", element: <DonorListPage /> },
        { path: "donors/new", element: <DonorCreatePage/> },
        { path: "donors/:id", element: <DonorViewPage/> },
        { path: "donors/:id/edit", element: <DonorEditPage/> },

        // Recipients
        { path: "recipients", element: <RecipientListPage /> },
        { path: "recipients/new", element: <RecipientCreatePage /> },
        { path: "recipients/:id", element: <RecipientViewPage /> },
        { path: "recipients/:id/edit", element: <RecipientEditPage /> },

        // Hospitals
        { path: "hospitals", element: <HospitalListPage /> },
        { path: "hospitals/new", element: <HospitalCreatePage /> },
        { path: "hospitals/:id", element: <HospitalViewPage /> },
        { path: "hospitals/:id/edit", element: <HospitalEditPage /> },

        // Blood Requests
        { path: "blood-requests", element: <BloodRequestListPage /> },
        { path: "blood-requests/new", element: <BloodRequestCreatePage /> },
        { path: "blood-requests/:id", element: <BloodRequestViewPage /> },
        { path: "blood-requests/:id/edit", element: <BloodRequestEditPage /> },

        // Donations
        { path: "donations", element: <DonationListPage /> },
        { path: "donations/:id", element: <DonationViewPage /> },

        // Reports
        { path: "reports", element: <ReportsWorkspacePage /> },

        // Notifications
        { path: "notifications", element: <NotificationListPage /> },
        { path: "notifications/:id", element: <NotificationViewPage /> },

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
