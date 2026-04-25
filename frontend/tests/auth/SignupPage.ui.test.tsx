import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignupPage from "@/modules/auth/pages/SignupPage";

const navigateMock = vi.hoisted(() => vi.fn());
const signupMutationRef = vi.hoisted(() => ({
  current: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: () => ({
    t: (
      key: string,
      defaultValue?: string | Record<string, unknown>,
      options?: Record<string, unknown>
    ) => {
      let value = typeof defaultValue === "string" ? defaultValue : key;
      if (options) {
        Object.entries(options).forEach(([name, token]) => {
          value = value.replace(`{{${name}}}`, String(token));
        });
      }
      return value;
    },
  }),
}));

vi.mock("@/modules/auth/api/useAuthMutations", () => ({
  useSignup: () => signupMutationRef.current,
}));

describe("SignupPage UI", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    signupMutationRef.current = {
      mutateAsync: vi.fn().mockResolvedValue({
        data: { message: "Signup successful" },
      }),
      isPending: false,
    };
  });

  it("preselects role from query and submits payload", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/auth/signup?role=recipient"]}>
        <SignupPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Role")).toHaveValue("Recipient");
    expect(screen.getByLabelText("Role")).toBeDisabled();

    await user.type(screen.getByLabelText("First Name"), "Sara");
    await user.type(screen.getByLabelText("Last Name"), "Khan");
    await user.type(screen.getByLabelText("Username"), "sara.khan");
    await user.type(screen.getByLabelText("Phone"), "0700000010");
    await user.type(screen.getByLabelText("Password"), "StrongPass123");
    await user.type(screen.getByLabelText("Confirm Password"), "StrongPass123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(signupMutationRef.current.mutateAsync).toHaveBeenCalledWith({
        first_name: "Sara",
        last_name: "Khan",
        username: "sara.khan",
        email: "",
        phone: "0700000010",
        role: "recipient",
        password: "StrongPass123",
        confirm_password: "StrongPass123",
      });
      expect(navigateMock).toHaveBeenCalledWith("/auth/login", { replace: true });
    });
  });

  it("blocks submit when password confirmation does not match", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/auth/signup?role=donor"]}>
        <SignupPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("First Name"), "Ali");
    await user.type(screen.getByLabelText("Last Name"), "Jan");
    await user.type(screen.getByLabelText("Username"), "ali.jan");
    await user.type(screen.getByLabelText("Phone"), "0700000011");
    await user.type(screen.getByLabelText("Password"), "StrongPass123");
    await user.type(screen.getByLabelText("Confirm Password"), "WrongPass123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(signupMutationRef.current.mutateAsync).not.toHaveBeenCalled();
  });
});
