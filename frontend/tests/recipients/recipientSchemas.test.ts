import { describe, expect, it } from "vitest";

import { recipientFormSchema } from "@/modules/recipients/schemas/recipientSchemas";

describe("recipientFormSchema", () => {
  it("accepts a valid payload", () => {
    const result = recipientFormSchema.safeParse({
      full_name: "Ahmad Khan",
      email: "ahmad@example.com",
      phone: "0700000001",
      required_blood_group: "O+",
      age: 24,
      gender: "male",
      hospital: 1,
      emergency_level: "urgent",
      status: "pending",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid age and invalid email", () => {
    const result = recipientFormSchema.safeParse({
      full_name: "A",
      email: "invalid-email",
      phone: "0700000001",
      required_blood_group: "O+",
      age: 0,
      gender: "male",
      hospital: 1,
      emergency_level: "urgent",
      status: "pending",
    });

    expect(result.success).toBe(false);
  });
});

