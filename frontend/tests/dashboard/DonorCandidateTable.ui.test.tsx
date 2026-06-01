import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DonorCandidateTable from "@/modules/dashboard/components/DonorCandidateTable";
import type { DonorCandidate } from "@/modules/dashboard/types/dashboard.types";

const donors: DonorCandidate[] = [
  {
    id: 1,
    first_name: "Exact",
    last_name: "Match",
    phone: "0700000001",
    email: null,
    blood_group: "O+",
    status: "active",
    last_donation_date: "2025-01-01",
    distance_km: "1.25",
    match_type: "exact",
    is_eligible: true,
    eligibility_status: "eligible",
    eligible_from: "2025-07-01",
    eligibility_reason: "At least six months have passed since the last donation.",
  },
  {
    id: 2,
    first_name: "Related",
    last_name: "Match",
    phone: "0700000002",
    email: null,
    blood_group: "O-",
    status: "active",
    last_donation_date: "2026-05-01",
    distance_km: "2.50",
    match_type: "compatible",
    is_eligible: false,
    eligibility_status: "not_eligible",
    eligible_from: "2026-11-01",
    eligibility_reason: "Less than six months have passed since the last donation.",
  },
];

describe("DonorCandidateTable", () => {
  it("renders distance, match type, and eligibility status", () => {
    render(
      <DonorCandidateTable
        donors={donors}
        isLoading={false}
        totalCount={2}
        page={1}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText("Exact Match")).toBeInTheDocument();
    expect(screen.getByText("1.25 KM")).toBeInTheDocument();
    expect(screen.getByText("Exact")).toBeInTheDocument();
    expect(screen.getByText("Compatible")).toBeInTheDocument();
    expect(screen.getByText("Active and Eligible")).toBeInTheDocument();
    expect(screen.getByText("Inactive / Not Eligible")).toBeInTheDocument();
    expect(screen.getByText("Eligible from 2026-11-01")).toBeInTheDocument();
  });
});
