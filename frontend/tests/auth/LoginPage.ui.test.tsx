import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/modules/auth/pages/LoginPage";

const storeRef = vi.hoisted(() => ({
  current: {
    login: vi.fn(),
    loading: false,
    error: null as string | null,
    clearError: vi.fn(),
    lockedUntil: null as string | null,
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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/modules/auth/stores/useUserStore", () => ({
  useUserStore: () => storeRef.current,
}));

describe("LoginPage UI", () => {
  beforeEach(() => {
    storeRef.current = {
      login: vi.fn(),
      loading: false,
      error: null,
      clearError: vi.fn(),
      lockedUntil: null,
    };
  });

  it("renders branded login shell and submit CTA", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Blood Donation Command Center")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows account lockout panel when backend returns 429", async () => {
    const user = userEvent.setup();
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const lockError = new AxiosError(
      "locked",
      undefined,
      undefined,
      undefined,
      {
        status: 429,
        data: { locked_until: lockedUntil },
      } as any
    );

    storeRef.current.login = vi.fn().mockRejectedValue(lockError);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Username"), "operator");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Account Temporarily Locked")).toBeInTheDocument();
    });
  });
});
