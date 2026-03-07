import { describe, expect, it } from "vitest";

import { notificationFilterSchema, notificationReadSchema } from "@/modules/notifications/schemas/notificationSchemas";

describe("notification schemas", () => {
  it("accepts valid filter payload", () => {
    const result = notificationFilterSchema.safeParse({
      search: "urgent",
      status: "delivered",
      type: "system",
      sent_via: "in_app",
      priority: "high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sent_via filter", () => {
    const result = notificationFilterSchema.safeParse({
      sent_via: "push",
      status: "",
      type: "",
      priority: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts read toggle payload", () => {
    const result = notificationReadSchema.safeParse({
      is_read: true,
    });
    expect(result.success).toBe(true);
  });
});
