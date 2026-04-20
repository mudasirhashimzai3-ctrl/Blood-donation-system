import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import VerifyEmailPage from "@/modules/auth/pages/VerifyEmailPage";

const navRef = vi.hoisted(() => ({ push: vi.fn() }));
const verifyRef = vi.hoisted(() => ({
  state: {
    mutate: vi.fn(),
    reset: vi.fn(),
    data: undefined as { data?: { email?: string } } | undefined,
    isSuccess: false,
    isError: false,
    isPending: false,
  },
}));
const resendRef = vi.hoisted(() => ({
  state: {
    mutate: vi.fn(),
    isPending: false,
  },
}));

vi.mock("react-i18next", () => ({
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

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navRef.push,
  };
});

vi.mock("@/modules/auth/api/useAuthMutations", () => ({
  useVerifyEmail: () => verifyRef.state,
  useResendVerification: () => resendRef.state,
}));

const renderWithRoute = () =>
  render(
    <MemoryRouter initialEntries={["/auth/verify-email/token-123"]}>
      <Routes>
        <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("VerifyEmailPage UI", () => {
  beforeEach(() => {
    navRef.push.mockReset();
    verifyRef.state = {
      mutate: vi.fn(),
      reset: vi.fn(),
      data: undefined,
      isSuccess: false,
      isError: false,
      isPending: false,
    };
    resendRef.state = {
      mutate: vi.fn(),
      isPending: false,
    };
  });

  it("renders loading state while verification is in progress", () => {
    verifyRef.state.isPending = true;

    renderWithRoute();

    expect(screen.getByText("Verifying your email")).toBeInTheDocument();
    expect(screen.getByText("Please wait while we validate your secure link.")).toBeInTheDocument();
  });

  it("renders success state when verification succeeds", () => {
    verifyRef.state.isSuccess = true;

    renderWithRoute();

    expect(screen.getByText("Email Verified")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to Login" })).toBeInTheDocument();
  });

  it("renders error state and resend CTA when verification fails", async () => {
    verifyRef.state.isError = true;
    verifyRef.state.data = { data: { email: "ops@blooddonation.org" } };

    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Resend Verification Email" })
    ).toBeInTheDocument();
  });
});
