import { beforeEach, describe, expect, it } from "vitest";

import { useReportsUiStore } from "@/modules/reports/stores/useReportsUiStore";

describe("useReportsUiStore", () => {
  beforeEach(() => {
    useReportsUiStore.setState({
      activeTab: "requests",
      dateFrom: "2026-01-01",
      dateTo: "2026-01-30",
      groupBy: "day",
      hospitalId: "",
      city: "",
      bloodGroup: "",
      requestType: "",
      priority: "",
      emergencyOnly: false,
      status: "",
      search: "",
      ordering: "",
      page: 1,
      pageSize: 25,
      compareMode: false,
    });
  });

  it("resets paging when search changes", () => {
    useReportsUiStore.getState().setPage(3);
    useReportsUiStore.getState().setSearch("kabul");
    expect(useReportsUiStore.getState().page).toBe(1);
    expect(useReportsUiStore.getState().search).toBe("kabul");
  });

  it("switches active tab", () => {
    useReportsUiStore.getState().setActiveTab("donations");
    expect(useReportsUiStore.getState().activeTab).toBe("donations");
  });
});
