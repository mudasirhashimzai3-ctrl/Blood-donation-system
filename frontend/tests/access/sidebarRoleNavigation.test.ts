import { describe, expect, it } from "vitest";

import { getSidebarNavigationDataByRole } from "@/components/sidebar/sidebarData";

describe("role-based sidebar navigation", () => {
  it("returns admin dashboard as the first admin route", () => {
    const adminItems = getSidebarNavigationDataByRole("admin");

    expect(adminItems[0]).toMatchObject({
      label: "Dashboard",
      path: "/dashboard",
    });
  });

  it("returns donor menu structure", () => {
    const donorItems = getSidebarNavigationDataByRole("donor").map((item) => item.label);

    expect(donorItems).toEqual([
      "Donor Dashboard",
      "Nearby Requests",
      "Accept / Reject Donation",
      "Donation History",
      "Notifications",
      "Profile",
      "Settings",
    ]);
  });

  it("returns recipient menu structure", () => {
    const recipientItems = getSidebarNavigationDataByRole("recipient").map((item) => item.label);

    expect(recipientItems).toEqual([
      "Recipient Dashboard",
      "Create Blood Request",
      "My Requests",
      "Donor Responses",
      "Notifications",
      "Profile",
      "Settings",
    ]);
  });
});
