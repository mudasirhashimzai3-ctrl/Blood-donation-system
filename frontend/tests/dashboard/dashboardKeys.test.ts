import { describe, expect, it } from "vitest";

import { dashboardKeys } from "@/modules/dashboard/queries/dashboardKeys";

describe("dashboardKeys", () => {
  it("builds a stable overview key", () => {
    const key = dashboardKeys.overview({
      date_from: "2026-03-01T00:00:00.000Z",
      date_to: "2026-03-04T23:59:59.000Z",
      group_by: "day",
    });

    expect(key[0]).toBe("dashboard");
    expect(key[1]).toBe("overview");
    expect(key[2]).toEqual({
      date_from: "2026-03-01T00:00:00.000Z",
      date_to: "2026-03-04T23:59:59.000Z",
      group_by: "day",
    });
  });
});
