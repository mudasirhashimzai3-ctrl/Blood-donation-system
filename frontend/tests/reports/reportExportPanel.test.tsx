import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReportExportPanel from "@/modules/reports/components/ReportExportPanel";

describe("ReportExportPanel", () => {
  it("hides export controls for non-admin", () => {
    render(
      <ReportExportPanel
        isAdmin={false}
        activeTab="requests"
        filters={{}}
        loading={false}
        format="csv"
        onFormatChange={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.queryByText("Queue Export")).not.toBeInTheDocument();
  });

  it("shows export controls for admin", () => {
    render(
      <ReportExportPanel
        isAdmin={true}
        activeTab="requests"
        filters={{}}
        loading={false}
        format="csv"
        onFormatChange={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByText("Queue Export")).toBeInTheDocument();
  });
});
