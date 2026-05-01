import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useDonorFilters } from "@/modules/donors/hooks/useDonorFilters";
import { useDonorUiStore } from "@/modules/donors/stores/useDonorUiStore";

describe("useDonorFilters", () => {
  afterEach(() => {
    act(() => {
      useDonorUiStore.setState({
        bloodGroup: "",
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("maps store values into donor query params without search/status", () => {
    act(() => {
      useDonorUiStore.setState({
        bloodGroup: "O+",
        page: 2,
        pageSize: 25,
      });
    });

    const { result } = renderHook(() => useDonorFilters());

    expect(result.current.queryParams).toEqual({
      page: 2,
      page_size: 25,
      blood_group: "O+",
    });
    expect(result.current.queryParams).not.toHaveProperty("search");
    expect(result.current.queryParams).not.toHaveProperty("status");
  });
});
