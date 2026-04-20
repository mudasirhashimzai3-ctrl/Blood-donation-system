import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RecipientCreatePage from "@/modules/recipients/pages/RecipientCreatePage";
import RecipientEditPage from "@/modules/recipients/pages/RecipientEditPage";
import RecipientListPage from "@/modules/recipients/pages/RecipientListPage";
import RecipientViewPage from "@/modules/recipients/pages/RecipientViewPage";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, fallback?: string) => fallback ?? _key,
    }),
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("@/hooks/useCan", () => ({
  default: () => ({
    can: () => false,
  }),
}));

vi.mock("@/modules/recipients/hooks/useRecipientFilters", () => ({
  useRecipientFilters: () => ({
    search: "",
    bloodGroup: "",
    emergencyLevel: "",
    city: "",
    status: "",
    page: 1,
    pageSize: 10,
    setSearch: vi.fn(),
    setBloodGroup: vi.fn(),
    setEmergencyLevel: vi.fn(),
    setCity: vi.fn(),
    setStatus: vi.fn(),
    setPage: vi.fn(),
    resetFilters: vi.fn(),
    queryParams: {},
  }),
}));

vi.mock("@/components", () => ({
  PageHeader: () => null,
}));

vi.mock("@components/ui", () => ({
  Card: ({ children }: { children: unknown }) => <div>{children}</div>,
  CardContent: ({ children }: { children: unknown }) => <div>{children}</div>,
}));

vi.mock("@/modules/recipients/components/RecipientFilters", () => ({
  default: () => null,
}));

vi.mock("@/modules/recipients/components/RecipientTable", () => ({
  default: () => null,
}));

vi.mock("@/modules/recipients/components/DeleteRecipientDialog", () => ({
  default: () => null,
}));

vi.mock("@/modules/recipients/components/BlockUnblockRecipientDialog", () => ({
  default: () => null,
}));

vi.mock("@/modules/recipients/components/RecipientForm", () => ({
  default: () => null,
}));

vi.mock("@/modules/recipients/hooks/useRecipientForm", () => ({
  useRecipientForm: () => ({}),
  normalizeRecipientPayload: vi.fn(),
  mapRecipientToFormValues: vi.fn(),
}));

vi.mock("@/modules/recipients/queries/useRecipientQueries", () => ({
  useRecipientsList: () => ({ data: { results: [], count: 0 }, isLoading: false, error: null }),
  useDeleteRecipient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBlockRecipient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUnblockRecipient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateRecipient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateRecipient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRecipient: () => ({ data: null, isLoading: false, error: null }),
}));

const expectThemedRoot = () => {
  const root = screen.getByTestId("recipient-page-root");
  expect(root).toBeInTheDocument();
  expect(root.className).toContain("recipient-theme");
};

describe("Recipient page theme wrappers", () => {
  it("applies recipient theme root on list page", () => {
    render(<RecipientListPage />);
    expectThemedRoot();
  });

  it("applies recipient theme root on create page", () => {
    render(<RecipientCreatePage />);
    expectThemedRoot();
  });

  it("applies recipient theme root on edit page", () => {
    render(<RecipientEditPage />);
    expectThemedRoot();
  });

  it("applies recipient theme root on view page", () => {
    render(<RecipientViewPage />);
    expectThemedRoot();
  });
});
