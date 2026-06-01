import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import RoleRoute from "@/providers/RoleRoute";
import { useUserStore, type UserProfile } from "@/modules/auth/stores/useUserStore";

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
});
