import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { BLOOD_GROUP_OPTIONS, type BloodGroup } from "../types/donor.types";

interface DonorFiltersProps {
  bloodGroup: BloodGroup | "";
  city: string;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onCityChange: (value: string) => void;
  onReset: () => void;
}

export default function DonorFilters({
  bloodGroup,
  city,
  onBloodGroupChange,
  onCityChange,
  onReset,
}: DonorFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Select
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={[
          { value: "", label: t("donors.filters.allBloodGroups", "All Blood Groups") },
          ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
        ]}
      />

      <Input
        placeholder={t("donors.filters.cityPlaceholder", "City")}
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
      />

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          {t("donors.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
