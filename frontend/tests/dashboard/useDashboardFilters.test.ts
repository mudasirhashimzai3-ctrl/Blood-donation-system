import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useDashboardFilters } from "@/modules/dashboard/hooks/useDashboardFilters";
import { useDashboardUiStore } from "@/modules/dashboard/stores/useDashboardUiStore";

describe("useDashboardFilters", () => {
  beforeEach(() => {
    localStorage.clear();
    useDashboardUiStore.setState({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-04",
      groupBy: "week",
    });
  });

  it("maps date inputs to ISO query params", () => {
    const { result } = renderHook(() => useDashboardFilters());
    const expectedDateFrom = new Date("2026-03-01T00:00:00").toISOString();
    const expectedDateTo = new Date("2026-03-04T23:59:59").toISOString();

    expect(result.current.queryParams).toEqual({
      date_from: expectedDateFrom,
      date_to: expectedDateTo,
      group_by: "week",
    });
  });
});
