import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RecipientTable from "@/modules/recipients/components/RecipientTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

describe("RecipientTable", () => {
  it("renders row data and triggers block toggle callback", () => {
    const onToggleBlock = vi.fn();

    render(
      <RecipientTable
        recipients={[
          {
            id: 1,
            full_name: "Ahmad Khan",
            phone: "0700000001",
            required_blood_group: "O+",
            hospital_name: "City Hospital",
            emergency_level: "critical",
            city: "Kabul",
            status: "blocked",
            created_at: "2026-02-24T10:00:00Z",
          },
        ]}
        isLoading={false}
        totalCount={1}
        page={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleBlock={onToggleBlock}
      />
    );

    expect(screen.getByText("Ahmad Khan")).toBeInTheDocument();
    expect(screen.getByText("City Hospital")).toBeInTheDocument();
    expect(screen.getByText("Kabul")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Unblock"));
    expect(onToggleBlock).toHaveBeenCalledWith(1, "blocked");
  });
});
