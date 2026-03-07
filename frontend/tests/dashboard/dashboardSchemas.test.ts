import { describe, expect, it } from "vitest";

import { dashboardOverviewResponseSchema } from "@/modules/dashboard/schemas/dashboardSchemas";

describe("dashboardSchemas", () => {
  it("parses dashboard overview response payload", () => {
    const parsed = dashboardOverviewResponseSchema.parse({
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
        total_donors: { value: 10, href: "/donors" },
        total_recipients: { value: 8, href: "/recipients" },
        active_requests: { value: 3, href: "/blood-requests" },
        completed_donations: { value: 20, href: "/donations" },
      },
      charts: {
        requests_status_distribution: [{ status: "pending", count: 2, href: "/blood-requests?status=pending" }],
        donations_trend: [{ bucket: "2026-03-01T00:00:00.000Z", completed: 2, cancelled: 1 }],
        blood_group_supply_vs_demand: [{ blood_group: "A+", donors: 5, active_requests: 2 }],
      },
      statistics: {
        request_completion_rate: 50,
        donation_completion_rate: 66.5,
        avg_donation_response_time_minutes: 17.2,
      },
      cache: {
        from_cache: false,
        ttl_seconds: 300,
      },
    });

    expect(parsed.kpis.total_donors?.value).toBe(10);
    expect(parsed.charts.donations_trend?.[0].completed).toBe(2);
  });
});
