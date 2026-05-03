import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useRecipientFilters } from "@/modules/recipients/hooks/useRecipientFilters";
import { useRecipientUiStore } from "@/modules/recipients/stores/useRecipientUiStore";

describe("useRecipientFilters", () => {
  afterEach(() => {
    useRecipientUiStore.setState({
      bloodGroup: "",
      emergencyLevel: "",
      city: "",
      page: 1,
      pageSize: 10,
    });
  });

  it("maps store values into query params", () => {
    useRecipientUiStore.setState({
      bloodGroup: "O+",
      emergencyLevel: "critical",
      city: "Kabul",
      page: 2,
      pageSize: 25,
    });

    const { result } = renderHook(() => useRecipientFilters());

    expect(result.current.queryParams).toEqual({
      page: 2,
      page_size: 25,
      required_blood_group: "O+",
      emergency_level: "critical",
      city: "Kabul",
    });
  });
});
