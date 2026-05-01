import { describe, expect, it } from "vitest";

import { donorFormSchema } from "@/modules/donors/schemas/donorSchemas";

describe("donorFormSchema", () => {
  it("accepts a valid payload without status/date_of_birth", () => {
    const result = donorFormSchema.safeParse({
      first_name: "Ahmad",
      last_name: "Karimi",
      phone: "0700000001",
      email: "ahmad@example.com",
      blood_group: "A+",
      profile_picture: null,
      remove_profile_picture: false,
      age: "25",
      permanent_address: "Kabul",
      local_address: "Herat",
      last_donation_date: "2026-01-15",
      latitude: "34.555300",
      longitude: "69.207500",
    });

    expect(result.success).toBe(true);
  });

  it("strips removed status and date_of_birth inputs", () => {
    const result = donorFormSchema.parse({
      first_name: "Ahmad",
      last_name: "Karimi",
      phone: "0700000001",
      email: "",
      blood_group: "A+",
      profile_picture: null,
      remove_profile_picture: false,
      age: "25",
      permanent_address: "",
      local_address: "",
      last_donation_date: "",
      latitude: "",
      longitude: "",
      status: "blocked",
      date_of_birth: "1990-01-01",
    });

    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("date_of_birth");
  });
});
