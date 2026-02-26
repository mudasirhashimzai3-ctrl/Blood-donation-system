import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";

interface HospitalFiltersProps {
  search: string;
  city: string;
  isActive: "" | "true" | "false";
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onIsActiveChange: (value: "" | "true" | "false") => void;
  onReset: () => void;
}

export default function HospitalFilters({
  search,
  city,
  isActive,
  onSearchChange,
  onCityChange,
  onIsActiveChange,
  onReset,
}: HospitalFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input
        placeholder={t("hospitals.filters.searchPlaceholder", "Search hospitals")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      <Input
        placeholder={t("hospitals.filters.cityPlaceholder", "City")}
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
      />

      <Select
        value={isActive}
        onChange={(event) => onIsActiveChange(event.target.value as "" | "true" | "false")}
        options={[
          { value: "", label: t("hospitals.filters.allStatuses", "All Statuses") },
          { value: "true", label: t("hospitals.status.active", "Active") },
          { value: "false", label: t("hospitals.status.inactive", "Inactive") },
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

