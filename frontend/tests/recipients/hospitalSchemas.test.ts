import { describe, expect, it } from "vitest";

import { hospitalFormSchema } from "@/modules/hospitals/schemas/hospitalSchemas";

describe("hospitalFormSchema", () => {
  it("accepts valid coordinates", () => {
    const result = hospitalFormSchema.safeParse({
      name: "City Hospital",
      phone: "0700100001",
      email: "city@example.com",
      address: "Main Street",
      city: "Kabul",
      latitude: "34.5553",
      longitude: "69.2075",
      is_active: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    const result = hospitalFormSchema.safeParse({
      name: "City Hospital",
      phone: "",
      email: "",
      address: "",
      city: "Kabul",
      latitude: "100",
      longitude: "190",
      is_active: true,
    });

    expect(result.success).toBe(false);
  });
});
