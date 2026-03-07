import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

import { reportService } from "@/modules/reports/services/reportService";

describe("reportService", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("calls request analytics endpoint", () => {
    reportService.getRequestAnalytics({ group_by: "day" });
    expect(mockGet).toHaveBeenCalledWith("/reports/request-analytics/", {
      params: { group_by: "day" },
    });
  });

  it("queues report export", () => {
    reportService.createExport({ report_type: "request_analytics", format: "csv" });
    expect(mockPost).toHaveBeenCalledWith("/reports/exports/", {
      report_type: "request_analytics",
      format: "csv",
    });
  });
});
