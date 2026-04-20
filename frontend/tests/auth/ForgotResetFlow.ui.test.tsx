import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";

const navRef = vi.hoisted(() => ({ push: vi.fn() }));
const mutationRef = vi.hoisted(() => ({
  forgotMutate: vi.fn(),
  verifyMutate: vi.fn(),
  forgotPending: false,
  verifyPending: false,
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
  useForgotPassword: () => ({
    mutateAsync: mutationRef.forgotMutate,
    isPending: mutationRef.forgotPending,
  }),
  useVerifyResetCode: () => ({
    mutateAsync: mutationRef.verifyMutate,
    isPending: mutationRef.verifyPending,
  }),
}));

describe("Forgot/Reset Auth Flow UI", () => {
  beforeEach(() => {
    navRef.push.mockReset();
    mutationRef.forgotPending = false;
    mutationRef.verifyPending = false;
    mutationRef.forgotMutate = vi.fn().mockResolvedValue({
      data: { success: true, masked_email: "b***@mail.com" },
    });
    mutationRef.verifyMutate = vi.fn().mockResolvedValue({
      data: { success: true },
    });
  });

  it("progresses from email step to code verification and navigates to reset", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Recover Access")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Email or Username"), "donor.agent");
    await user.click(screen.getByRole("button", { name: "Send Verification Code" }));

    await waitFor(() => {
      expect(screen.getByText("Verify Security Code")).toBeInTheDocument();
    });

    for (let index = 1; index <= 6; index += 1) {
      await user.type(screen.getByLabelText(`Digit ${index}`), String(index));
    }

    await waitFor(() => {
      expect(navRef.push).toHaveBeenCalledWith(
        "/auth/reset-password",
        expect.objectContaining({
          state: {
            emailOrUsername: "donor.agent",
            code: "123456",
          },
        })
      );
    });
  });
});
