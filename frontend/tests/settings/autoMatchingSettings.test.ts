import { describe, expect, it } from "vitest";

import { autoMatchingSettingsSchema } from "@/modules/settings/schemas/autoMatchingSettings.schema";

describe("autoMatchingSettingsSchema", () => {
  it("accepts configured notification radius values", () => {
    const parsed = autoMatchingSettingsSchema.parse({
      enabled: true,
      max_distance_km: "20",
      prioritize_rare_blood_groups: true,
      prioritize_recently_active_donors: true,
      max_candidates_to_notify: 50,
      retry_interval_minutes: 10,
    });

    expect(parsed.max_distance_km).toBe(20);
  });

  it("rejects unsupported notification radii", () => {
    expect(() =>
      autoMatchingSettingsSchema.parse({
        enabled: true,
        max_distance_km: 15,
        prioritize_rare_blood_groups: true,
        prioritize_recently_active_donors: true,
        max_candidates_to_notify: 50,
        retry_interval_minutes: 10,
      })
    ).toThrow();
  });
});
