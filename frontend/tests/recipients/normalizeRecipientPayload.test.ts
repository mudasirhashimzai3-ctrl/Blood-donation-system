import { describe, expect, it } from "vitest";

import { normalizeRecipientPayload } from "@/modules/recipients/hooks/useRecipientForm";

describe("normalizeRecipientPayload", () => {
  it("trims strings and converts empty email to null", () => {
    const payload = normalizeRecipientPayload({
      full_name: "  Ahmad Khan  ",
      email: "  ",
      phone: " 0700000001 ",
      required_blood_group: "O+",
      age: 22,
      gender: "male",
      hospital: 2,
      emergency_level: "normal",
      status: "pending",
    });

    expect(payload.full_name).toBe("Ahmad Khan");
    expect(payload.phone).toBe("0700000001");
    expect(payload.email).toBeNull();
  });
});

