import { describe, expect, it } from "vitest";

import { createReportExportSchema, reportFiltersSchema } from "@/modules/reports/schemas/reportSchemas";

describe("reportSchemas", () => {
  it("validates a valid date range", () => {
    const value = reportFiltersSchema.parse({
      date_from: "2026-01-01T00:00:00.000Z",
      date_to: "2026-01-10T23:59:59.000Z",
      group_by: "day",
    });

    expect(value.group_by).toBe("day");
  });

  it("rejects date_from after date_to", () => {
    const parsed = reportFiltersSchema.safeParse({
      date_from: "2026-02-10T00:00:00.000Z",
      date_to: "2026-01-10T00:00:00.000Z",
    });

    expect(parsed.success).toBe(false);
  });

  it("validates export payload", () => {
    const value = createReportExportSchema.parse({
      report_type: "system_performance",
      format: "pdf",
    });
    expect(value.report_type).toBe("system_performance");
    expect(value.format).toBe("pdf");
  });
});
