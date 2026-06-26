import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiGetMock } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: apiGetMock,
  },
}));

import { reportService } from "@/modules/reports/services/reportService";

describe("reportService", () => {
  beforeEach(() => {
    apiGetMock.mockResolvedValue({ data: {} });
    apiGetMock.mockClear();
  });

  it("requests fresh report analytics with cache=false", async () => {
    await reportService.getRequestAnalytics({
      group_by: "week",
      city: "Kabul",
      blood_group: "O+",
      request_type: "urgent",
      emergency_only: true,
    });

    expect(apiGetMock).toHaveBeenCalledWith("/reports/request-analytics/", {
      params: {
        group_by: "week",
        city: "Kabul",
        blood_group: "O+",
        request_type: "urgent",
        emergency_only: true,
        cache: "false",
      },
    });
  });
});
