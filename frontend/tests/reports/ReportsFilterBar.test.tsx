import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReportsFilterBar from "@/modules/reports/components/ReportsFilterBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe("ReportsFilterBar", () => {
  it("renders report filters and refresh controls", () => {
    const onRefresh = vi.fn();
    const onReset = vi.fn();

    render(
      <ReportsFilterBar
        dateFrom="2026-01-01"
        dateTo="2026-01-31"
        groupBy="day"
        city=""
        bloodGroup=""
        requestType=""
        emergencyOnly={false}
        onDateFromChange={vi.fn()}
        onDateToChange={vi.fn()}
        onGroupByChange={vi.fn()}
        onCityChange={vi.fn()}
        onBloodGroupChange={vi.fn()}
        onRequestTypeChange={vi.fn()}
        onEmergencyOnlyChange={vi.fn()}
        onReset={onReset}
        onRefresh={onRefresh}
        activeTab="requests"
        filters={{ group_by: "day", cache: "false" }}
      />
    );

    expect(screen.getByLabelText(/Date From/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date To/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Group By/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Blood Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Emergency only/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Refresh/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
