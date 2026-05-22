import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DonationTable from "@/modules/donations/components/DonationTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

describe("DonationTable", () => {
  it("shows recipient name instead of request number", () => {
    render(
      <DonationTable
        donations={[
          {
            id: 1,
            request: 42,
            donor: 7,
            donor_name: "Donor One",
            donor_phone: "0700000001",
            recipient_name: "Recipient One",
            status: "pending",
            response_time: null,
            distance_km: "2.3",
            estimated_arrival_time: 15,
            is_primary: true,
            notified_at: null,
            reminder_sent_at: null,
            request_status: "pending",
            request_response_deadline: null,
            nearby_donors_count_dynamic: 1,
            estimated_time_dynamic: 15,
            distance_dynamic: "2.3",
            created_at: "2026-05-22T00:00:00Z",
            updated_at: "2026-05-22T00:00:00Z",
          },
        ]}
        isLoading={false}
        totalCount={1}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        onView={() => {}}
      />
    );

    expect(screen.getByText("Recipient One")).toBeInTheDocument();
    expect(screen.queryByText("#42")).not.toBeInTheDocument();
  });
});
