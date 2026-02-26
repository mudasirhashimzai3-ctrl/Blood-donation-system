import { describe, expect, it } from "vitest";

import { hospitalFormSchema } from "@/modules/recipients/schemas/hospitalSchemas";

describe("hospitalFormSchema", () => {
  it("accepts valid coordinates", () => {
    const result = hospitalFormSchema.safeParse({
      name: "City Hospital",
      contact_phone: "0700100001",
      address: "Main Street",
      city: "Kabul",
      latitude: "34.5553",
      longitude: "69.2075",
    });

    expect(result.success).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    const result = hospitalFormSchema.safeParse({
      name: "City Hospital",
      contact_phone: "",
      address: "",
      city: "Kabul",
      latitude: "100",
      longitude: "190",
    });

    expect(result.success).toBe(false);
  });
});

