import { describe, expect, it } from "vitest";

import { getSidebarNavigationDataByRole } from "@/components/sidebar/sidebarData";

describe("role-based sidebar navigation", () => {
  it("returns donor menu structure", () => {
    const donorItems = getSidebarNavigationDataByRole("donor").map((item) => item.label);

    expect(donorItems).toEqual([
      "Donor Dashboard",
      "Nearby Requests",
      "Emergency Requests",
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
      "Emergency Request",
      "My Requests",
      "Donor Responses",
      "Notifications",
      "Profile",
      "Settings",
    ]);
  });
});
