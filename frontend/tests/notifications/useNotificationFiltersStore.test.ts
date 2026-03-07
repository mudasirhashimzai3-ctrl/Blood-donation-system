import { beforeEach, describe, expect, it } from "vitest";

import { useNotificationUiStore } from "@/modules/notifications/stores/useNotificationUiStore";

describe("useNotificationUiStore", () => {
  beforeEach(() => {
    useNotificationUiStore.setState({
      search: "",
      status: "",
      type: "",
      sentVia: "",
      priority: "",
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
    });
  });

  it("updates filters and resets page", () => {
    useNotificationUiStore.getState().setPage(3);
    useNotificationUiStore.getState().setSearch("critical");
    expect(useNotificationUiStore.getState().page).toBe(1);
    expect(useNotificationUiStore.getState().search).toBe("critical");
  });

  it("resets filters", () => {
    useNotificationUiStore.getState().setStatus("failed");
    useNotificationUiStore.getState().setType("system");
    useNotificationUiStore.getState().setOrdering("status");
    useNotificationUiStore.getState().resetFilters();
    expect(useNotificationUiStore.getState().status).toBe("");
    expect(useNotificationUiStore.getState().type).toBe("");
    expect(useNotificationUiStore.getState().ordering).toBe("-created_at");
  });
});
