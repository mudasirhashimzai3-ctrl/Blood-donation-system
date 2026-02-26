import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useRecipientFilters } from "@/modules/recipients/hooks/useRecipientFilters";
import { useRecipientUiStore } from "@/modules/recipients/stores/useRecipientUiStore";

describe("useRecipientFilters", () => {
  afterEach(() => {
    useRecipientUiStore.setState({
      search: "",
      bloodGroup: "",
      emergencyLevel: "",
      city: "",
      status: "",
      page: 1,
      pageSize: 10,
    });
  });

  it("maps store values into query params", () => {
    useRecipientUiStore.setState({
      search: "Ali",
      bloodGroup: "O+",
      emergencyLevel: "critical",
      city: "Kabul",
      status: "blocked",
      page: 2,
      pageSize: 25,
    });

    const { result } = renderHook(() => useRecipientFilters());

    expect(result.current.queryParams).toEqual({
      page: 2,
      page_size: 25,
      search: "Ali",
      required_blood_group: "O+",
      emergency_level: "critical",
      city: "Kabul",
      status: "blocked",
    });
  });
});

