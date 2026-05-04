import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BloodRequestListPage from "@/modules/blood-requests/pages/BloodRequestListPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/hooks/useCan", () => ({
  default: () => ({ can: () => true }),
}));

vi.mock("@/components", () => ({
  PageHeader: ({
    title,
    actions,
  }: {
    title: string;
    actions?: Array<{ label: string; onClick: () => void }>;
  }) => (
    <div>
      <h1>{title}</h1>
      {actions?.map((action) => (
        <button key={action.label} type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/modules/blood-requests/components/BloodRequestFilters", () => ({
  default: () => <div>filters</div>,
}));

vi.mock("@/modules/blood-requests/components/BloodRequestTable", () => ({
  default: () => <div>table</div>,
}));

vi.mock("@/modules/blood-requests/hooks/useBloodRequestFilters", () => ({
  useBloodRequestFilters: () => ({
    search: "",
    status: "",
    bloodGroup: "",
    requestType: "",
    page: 1,
    pageSize: 10,
    setSearch: vi.fn(),
    setStatus: vi.fn(),
    setBloodGroup: vi.fn(),
    setRequestType: vi.fn(),
    setPage: vi.fn(),
    resetFilters: vi.fn(),
    queryParams: {},
  }),
}));

vi.mock("@/modules/blood-requests/queries/useBloodRequestQueries", () => ({
  useBloodRequestsList: () => ({ data: { results: [], count: 0 }, isLoading: false, error: null }),
  useDeleteBloodRequest: () => ({ mutateAsync: vi.fn() }),
  useRunAutoMatch: () => ({ mutateAsync: vi.fn() }),
}));

describe("BloodRequestListPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("shows add request button and navigates to create page", () => {
    render(<BloodRequestListPage />);

    fireEvent.click(screen.getByRole("button", { name: /Add Request/i }));
    expect(navigateMock).toHaveBeenCalledWith("/blood-requests/new");
  });
});

