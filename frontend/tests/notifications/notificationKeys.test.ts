import { describe, expect, it } from "vitest";

import { notificationKeys } from "@/modules/notifications/queries/notificationKeys";

describe("notificationKeys", () => {
  it("creates stable list keys", () => {
    const params = { page: 1, status: "queued" as const };
    expect(notificationKeys.list(params)).toEqual([...(notificationKeys.lists()), params]);
  });

  it("creates stable detail keys", () => {
    expect(notificationKeys.detail(12)).toEqual([...(notificationKeys.details()), 12]);
  });
});
