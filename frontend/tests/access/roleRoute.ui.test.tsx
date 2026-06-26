import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import RoleRoute from "@/providers/RoleRoute";
import { useUserStore, type UserProfile } from "@/modules/auth/stores/useUserStore";

const originalFetchUserProfile = useUserStore.getState().fetchUserProfile;
const originalLogout = useUserStore.getState().logout;

const buildProfile = (role: UserProfile["role"]): UserProfile => ({
  id: "1",
  firstName: "Test",
  lastName: "User",
  username: "test-user",
  email: "test@example.com",
  phone: "0700000000",
  role,
  avatarUrl: "",
  location: 1,
  permissions: ["notifications", "blood_requests", "donations"],
  preferences: {
    language: "en",
    timezone: "UTC",
    currency: "USD",
    theme: "light",
  },
});

afterEach(() => {
  sessionStorage.clear();
  useUserStore.setState({
    fetchUserProfile: originalFetchUserProfile,
    logout: originalLogout,
  });
  useUserStore.getState().reset();
});

describe("RoleRoute", () => {
  it("redirects donor away from admin-only route", () => {
    useUserStore.setState({ userProfile: buildProfile("donor") });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/settings" element={<div>Admin Settings</div>} />
          </Route>
          <Route path="/donor/dashboard" element={<div>Donor Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Donor Home")).toBeInTheDocument();
  });

  it("allows admin to access admin-only route", () => {
    useUserStore.setState({ userProfile: buildProfile("admin") });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/settings" element={<div>Admin Settings</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Settings")).toBeInTheDocument();
  });

  it("keeps admin dashboard admin-only", () => {
    useUserStore.setState({ userProfile: buildProfile("recipient") });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<div>Admin Dashboard</div>} />
          </Route>
          <Route path="/recipient/dashboard" element={<div>Recipient Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Recipient Home")).toBeInTheDocument();
  });

  it("hydrates the profile instead of redirecting when a token exists without a role", async () => {
    sessionStorage.setItem("accessToken", "test-token");
    const fetchUserProfile = vi.fn().mockImplementation(async () => {
      useUserStore.setState({
        userProfile: buildProfile("admin"),
        loading: false,
      });
    });

    useUserStore.setState({
      userProfile: null,
      loading: false,
      fetchUserProfile,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<div>Admin Dashboard</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchUserProfile).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
