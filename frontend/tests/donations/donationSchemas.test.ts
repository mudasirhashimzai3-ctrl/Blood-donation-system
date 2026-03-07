import { describe, expect, it } from "vitest";

import { donationReminderSchema, donationStatusUpdateSchema } from "@/modules/donations/schemas/donationSchemas";

describe("donation schemas", () => {
  it("accepts valid status payload", () => {
    const result = donationStatusUpdateSchema.safeParse({
      status: "accepted",
      notes: "Donor confirmed",
      cancellation_reason: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects cancelled status without reason", () => {
    const result = donationStatusUpdateSchema.safeParse({
      status: "cancelled",
      notes: "",
      cancellation_reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates reminder channels", () => {
    const result = donationReminderSchema.safeParse({
      channels: ["in_app", "email"],
    });
    expect(result.success).toBe(true);
  });
});
