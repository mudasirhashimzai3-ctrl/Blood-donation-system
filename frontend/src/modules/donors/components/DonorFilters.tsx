import { useTranslation } from "react-i18next";

import { Button, Select } from "@components/ui";
import { BLOOD_GROUP_OPTIONS, type BloodGroup } from "../types/donor.types";

interface DonorFiltersProps {
  bloodGroup: BloodGroup | "";
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onReset: () => void;
}

export default function DonorFilters({
  bloodGroup,
  onBloodGroupChange,
  onReset,
}: DonorFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={[
          { value: "", label: t("donors.filters.allBloodGroups", "All Blood Groups") },
          ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
        ]}
      />

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          {t("donors.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
