import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { AFGHANISTAN_PROVINCES, type Province } from "../types/hospital.types";

interface HospitalFiltersProps {
  search: string;
  province: Province | "";
  onSearchChange: (value: string) => void;
  onProvinceChange: (value: Province | "") => void;
  onReset: () => void;
}

export default function HospitalFilters({
  search,
  province,
  onSearchChange,
  onProvinceChange,
  onReset,
}: HospitalFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Input
        placeholder={t("hospitals.filters.searchPlaceholder", "Search hospitals")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      <Select
        value={province}
        onChange={(event) => onProvinceChange(event.target.value as Province | "")}
        options={[
          { value: "", label: t("hospitals.filters.provincePlaceholder", "Province") },
          ...AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value })),
        ]}
      />

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          {t("hospitals.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
