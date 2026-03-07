import { beforeEach, describe, expect, it } from "vitest";

import { useDonationUiStore } from "@/modules/donations/stores/useDonationUiStore";

describe("useDonationUiStore", () => {
  beforeEach(() => {
    useDonationUiStore.setState({
      search: "",
      status: "",
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
    });
  });

  it("updates filters and resets page", () => {
    useDonationUiStore.getState().setPage(3);
    useDonationUiStore.getState().setSearch("ali");
    expect(useDonationUiStore.getState().page).toBe(1);
    expect(useDonationUiStore.getState().search).toBe("ali");
  });

  it("resets filters", () => {
    useDonationUiStore.getState().setStatus("accepted");
    useDonationUiStore.getState().setOrdering("distance_km");
    useDonationUiStore.getState().resetFilters();
    expect(useDonationUiStore.getState().status).toBe("");
    expect(useDonationUiStore.getState().ordering).toBe("-created_at");
  });
});
