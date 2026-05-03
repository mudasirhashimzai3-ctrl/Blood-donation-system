import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EmergencyLevelBadge from "@/modules/recipients/components/EmergencyLevelBadge";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

describe("Recipient badge mapping", () => {
  it("renders critical emergency badge with pulse class", () => {
    render(<EmergencyLevelBadge level="critical" />);
    const badge = screen.getByTestId("recipient-emergency-critical");
    expect(badge).toBeInTheDocument();
    expect(badge.querySelector(".recipient-critical-pulse")).toBeTruthy();
  });
});
