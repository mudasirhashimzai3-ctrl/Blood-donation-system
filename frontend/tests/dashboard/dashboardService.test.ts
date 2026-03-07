import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: mockGet,
  },
}));

import { dashboardService } from "@/modules/dashboard/services/dashboardService";

describe("dashboardService", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("calls dashboard overview endpoint with query params", () => {
    dashboardService.getOverview({
      date_from: "2026-03-01T00:00:00.000Z",
      date_to: "2026-03-04T23:59:59.000Z",
      group_by: "day",
    });

    expect(mockGet).toHaveBeenCalledWith("/reports/dashboard-overview/", {
      params: {
        date_from: "2026-03-01T00:00:00.000Z",
        date_to: "2026-03-04T23:59:59.000Z",
        group_by: "day",
      },
    });
  });
});
