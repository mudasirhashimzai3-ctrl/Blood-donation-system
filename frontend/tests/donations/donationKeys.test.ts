import { describe, expect, it } from "vitest";

import { donationKeys } from "@/modules/donations/queries/donationKeys";

describe("donationKeys", () => {
  it("creates stable list keys", () => {
    const params = { page: 1, status: "pending" as const };
    expect(donationKeys.list(params)).toEqual([...(donationKeys.lists()), params]);
  });

  it("creates stable detail keys", () => {
    expect(donationKeys.detail(5)).toEqual([...(donationKeys.details()), 5]);
  });
});
