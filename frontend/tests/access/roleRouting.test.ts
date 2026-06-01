import { describe, expect, it } from "vitest";

import {
  getHomeRouteByRole,
  getNotificationsRouteByRole,
  getProfileRouteByRole,
  getSettingsRouteByRole,
} from "@/modules/auth/utils/roleRouting";

describe("roleRouting helpers", () => {
  it("returns role-based default home routes", () => {
    expect(getHomeRouteByRole("admin")).toBe("/dashboard");
    expect(getHomeRouteByRole("donor")).toBe("/donor/dashboard");
    expect(getHomeRouteByRole("recipient")).toBe("/recipient/dashboard");
  });

  it("returns role-scoped profile, settings, and notifications routes", () => {
    expect(getProfileRouteByRole("donor")).toBe("/donor/profile");
    expect(getProfileRouteByRole("recipient")).toBe("/recipient/profile");
    expect(getProfileRouteByRole("admin")).toBe("/profile");

    expect(getSettingsRouteByRole("donor")).toBe("/donor/settings");
    expect(getSettingsRouteByRole("recipient")).toBe("/recipient/settings");
    expect(getSettingsRouteByRole("admin")).toBe("/settings");

    expect(getNotificationsRouteByRole("donor")).toBe("/donor/notifications");
    expect(getNotificationsRouteByRole("recipient")).toBe("/recipient/notifications");
    expect(getNotificationsRouteByRole("admin")).toBe("/notifications");
  });
});
