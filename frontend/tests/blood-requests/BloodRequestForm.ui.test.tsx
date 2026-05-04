import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BloodRequestForm from "@/modules/blood-requests/components/BloodRequestForm";
import { useBloodRequestForm } from "@/modules/blood-requests/hooks/useBloodRequestForm";

const { useHospitalsListMock, useAllHospitalsListMock } = vi.hoisted(() => ({
  useHospitalsListMock: vi.fn((params?: { province?: string }) => {
    if (params?.province === "Kabul") {
      return {
        data: {
          results: [{ id: 1, name: "Kabul Central Hospital", province: "Kabul" }],
        },
      };
    }
    if (params?.province === "Herat") {
      return {
        data: {
          results: [{ id: 2, name: "Herat Regional Hospital", province: "Herat" }],
        },
      };
    }
    return { data: { results: [] } };
  }),
  useAllHospitalsListMock: vi.fn(() => ({
    data: [
      { id: 1, name: "Kabul Central Hospital", province: "Kabul" },
      { id: 2, name: "Herat Regional Hospital", province: "Herat" },
    ],
  })),
}));

vi.mock("@/modules/hospitals", () => ({
  AFGHANISTAN_PROVINCES: ["Kabul", "Herat"],
  useHospital: vi.fn(() => ({ data: undefined })),
  useHospitalsList: useHospitalsListMock,
  useAllHospitalsList: useAllHospitalsListMock,
  HospitalQuickCreateModal: ({
    isOpen,
    province,
    onCreated,
  }: {
    isOpen: boolean;
    province?: string;
    onCreated: (hospital: {
      id: number;
      name: string;
      province: string;
      latitude: string;
      longitude: string;
    }) => void;
  }) =>
    isOpen ? (
      <button
        type="button"
        onClick={() =>
          onCreated({
            id: 999,
            name: `${province || "Kabul"} New Hospital`,
            province: province || "Kabul",
            latitude: "34.555300",
            longitude: "69.207500",
          })
        }
      >
        Mock Create Hospital
      </button>
    ) : null,
}));

function BloodRequestFormHarness({ recipientMode = false }: { recipientMode?: boolean }) {
  const form = useBloodRequestForm();
  return (
    <BloodRequestForm
      form={form}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      submitLabel="Save Request"
      recipientMode={recipientMode}
    />
  );
}

describe("BloodRequestForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not show recipient search/select inputs", () => {
    render(<BloodRequestFormHarness />);

    expect(screen.queryByLabelText(/Search Recipient/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Recipient$/i)).not.toBeInTheDocument();
  });

  it("filters hospitals by province and resets hospital on province change", () => {
    render(<BloodRequestFormHarness recipientMode />);

    const provinceSelect = screen.getByLabelText(/Province/i);
    const hospitalSelect = screen.getByLabelText(/Hospital/i) as HTMLSelectElement;

    expect(screen.getByRole("option", { name: "Kabul Central Hospital (Kabul)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Herat Regional Hospital (Herat)" })).toBeInTheDocument();

    fireEvent.change(provinceSelect, { target: { value: "Kabul" } });
    expect(screen.getByRole("option", { name: "Kabul Central Hospital (Kabul)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Herat Regional Hospital (Herat)" })).not.toBeInTheDocument();

    fireEvent.change(hospitalSelect, { target: { value: "1" } });
    expect(hospitalSelect.value).toBe("1");

    fireEvent.change(provinceSelect, { target: { value: "Herat" } });
    expect(hospitalSelect.value).toBe("");
    expect(screen.queryByRole("option", { name: "Kabul Central Hospital (Kabul)" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Herat Regional Hospital (Herat)" })).toBeInTheDocument();

    fireEvent.change(provinceSelect, { target: { value: "" } });
    expect(screen.getByRole("option", { name: "Kabul Central Hospital (Kabul)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Herat Regional Hospital (Herat)" })).toBeInTheDocument();
  });

  it("hides advanced fields in recipient mode", () => {
    render(<BloodRequestFormHarness recipientMode />);

    expect(screen.queryByLabelText(/Latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Longitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Response Deadline/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Auto match enabled/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Blood Group/i)).toBeInTheDocument();
  });

  it("selects newly created hospital from add hospital action", () => {
    render(<BloodRequestFormHarness recipientMode />);

    const provinceSelect = screen.getByLabelText(/Province/i);
    const hospitalSelect = screen.getByLabelText(/Hospital/i) as HTMLSelectElement;

    fireEvent.change(provinceSelect, { target: { value: "Kabul" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Hospital/i }));
    fireEvent.click(screen.getByRole("button", { name: /Mock Create Hospital/i }));

    expect(screen.getByRole("option", { name: "Kabul New Hospital (Kabul)" })).toBeInTheDocument();
    expect(hospitalSelect.value).toBe("999");
  });
});
