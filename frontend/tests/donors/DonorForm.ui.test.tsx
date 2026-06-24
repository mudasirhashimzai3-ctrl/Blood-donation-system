import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DonorForm from "@/modules/donors/components/DonorForm";
import { useDonorForm } from "@/modules/donors/hooks/useDonorForm";

function DonorFormHarness() {
  const form = useDonorForm();

  return (
    <DonorForm
      form={form}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      submitLabel="Save Donor"
    />
  );
}

describe("DonorForm", () => {
  it("hides Register My Location, status, and date of birth inputs", () => {
    render(<DonorFormHarness />);

    expect(screen.queryByRole("button", { name: /Register My Location/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Date of Birth/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Permanent Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Local Address/i)).toBeInTheDocument();
  });
});
