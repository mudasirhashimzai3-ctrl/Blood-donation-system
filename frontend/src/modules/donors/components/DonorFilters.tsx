import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { BLOOD_GROUP_OPTIONS, type BloodGroup, type DonorStatus } from "../types/donor.types";

interface DonorFiltersProps {
  search: string;
  bloodGroup: BloodGroup | "";
  status: DonorStatus | "";
  onSearchChange: (value: string) => void;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onStatusChange: (value: DonorStatus | "") => void;
  onReset: () => void;
}

export default function DonorFilters({
  search,
  bloodGroup,
  status,
  onSearchChange,
  onBloodGroupChange,
  onStatusChange,
  onReset,
}: DonorFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Input
        placeholder={t("donors.filters.searchPlaceholder", "Search donors")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      <Select
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={[
          { value: "", label: t("donors.filters.allBloodGroups", "All Blood Groups") },
          ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
        ]}
      />

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as DonorStatus | "")}
        options={[
          { value: "", label: t("donors.filters.allStatuses", "All Statuses") },
          { value: "active", label: t("donors.status.active", "Active") },
          { value: "blocked", label: t("donors.status.blocked", "Blocked") },
          { value: "pending", label: t("donors.status.pending", "Pending") },
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
