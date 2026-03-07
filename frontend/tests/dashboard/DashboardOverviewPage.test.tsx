import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardOverviewPage from "@/modules/dashboard/pages/DashboardOverviewPage";
import type { DashboardOverviewResponse } from "@/modules/dashboard/types/dashboard.types";

const {
  queryStateRef,
  navMocks,
  mockFiltersHook,
} = vi.hoisted(() => ({
  queryStateRef: { current: {} as Record<string, unknown> },
  navMocks: {
    goToDonors: vi.fn(),
    goToRecipients: vi.fn(),
    goToRequests: vi.fn(),
    goToActiveRequests: vi.fn(),
    goToDonations: vi.fn(),
  },
  mockFiltersHook: vi.fn(),
}));

vi.mock("@/modules/dashboard/queries/useDashboardQueries", () => ({
  useDashboardOverview: () => queryStateRef.current,
}));

vi.mock("@/modules/dashboard/hooks/useDashboardNavigation", () => ({
  useDashboardNavigation: () => navMocks,
}));

vi.mock("@/modules/dashboard/hooks/useDashboardFilters", () => ({
  useDashboardFilters: () => mockFiltersHook(),
}));

const buildResponse = (): DashboardOverviewResponse => ({
  generated_at: "2026-03-04T09:00:00.000Z",
  filters: {
    date_from: "2026-02-03T00:00:00.000Z",
    date_to: "2026-03-04T23:59:59.000Z",
    group_by: "day",
  },
  access: {
    donors: true,
    recipients: true,
    blood_requests: true,
    donations: true,
  },
  kpis: {
    total_donors: { value: 15, href: "/donors" },
    total_recipients: { value: 8, href: "/recipients" },
    active_requests: { value: 3, href: "/blood-requests" },
    completed_donations: { value: 22, href: "/donations" },
  },
  charts: {
    requests_status_distribution: [
      { status: "pending", count: 1, href: "/blood-requests?status=pending" },
      { status: "matched", count: 2, href: "/blood-requests?status=matched" },
    ],
    donations_trend: [{ bucket: "2026-03-01T00:00:00.000Z", completed: 2, cancelled: 1 }],
    blood_group_supply_vs_demand: [{ blood_group: "A+", donors: 4, active_requests: 1 }],
  },
  statistics: {
    request_completion_rate: 52.4,
    donation_completion_rate: 67.1,
    avg_donation_response_time_minutes: 19.3,
  },
  cache: {
    from_cache: false,
    ttl_seconds: 300,
  },
});

describe("DashboardOverviewPage", () => {
  beforeEach(() => {
    navMocks.goToDonors.mockReset();
    navMocks.goToRecipients.mockReset();
    navMocks.goToRequests.mockReset();
    navMocks.goToActiveRequests.mockReset();
    navMocks.goToDonations.mockReset();

    mockFiltersHook.mockReturnValue({
      dateFrom: "2026-02-03",
      dateTo: "2026-03-04",
      groupBy: "day",
      setDateFrom: vi.fn(),
      setDateTo: vi.fn(),
      setGroupBy: vi.fn(),
      resetFilters: vi.fn(),
      queryParams: {
        date_from: "2026-02-03T00:00:00.000Z",
        date_to: "2026-03-04T23:59:59.000Z",
        group_by: "day",
      },
    });

    queryStateRef.current = {
      data: buildResponse(),
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    };
  });

  it("renders KPI cards and charts on success", () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText("Total Donors")).toBeInTheDocument();
    expect(screen.getByText("Total Recipients")).toBeInTheDocument();
    expect(screen.getByText("Request Status Distribution")).toBeInTheDocument();
    expect(screen.getByText("Donations Trend")).toBeInTheDocument();
    expect(screen.getByText("Blood Group Supply vs Demand")).toBeInTheDocument();
  });

  it("shows skeleton while loading", () => {
    queryStateRef.current = {
      data: undefined,
      isLoading: true,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    };

    const { container } = render(<DashboardOverviewPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows retry state on error", () => {
    queryStateRef.current = {
      data: undefined,
      isLoading: false,
      error: new Error("failed"),
      isFetching: false,
      refetch: vi.fn(),
    };

    render(<DashboardOverviewPage />);
    expect(screen.getByText("Dashboard data could not be loaded.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("shows restricted state for unauthorized widgets", () => {
    const payload = buildResponse();
    payload.access.donors = false;
    payload.kpis.total_donors = null;
    payload.charts.blood_group_supply_vs_demand = null;

    queryStateRef.current = {
      data: payload,
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    };

    render(<DashboardOverviewPage />);
    expect(screen.getByText("Donor metrics are unavailable for your current permissions.")).toBeInTheDocument();
    expect(screen.getByText("Supply and demand chart is restricted for your account.")).toBeInTheDocument();
  });

  it("navigates when KPI card is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardOverviewPage />);

    await user.click(screen.getByText("Total Donors"));
    expect(navMocks.goToDonors).toHaveBeenCalledTimes(1);
  });
});
