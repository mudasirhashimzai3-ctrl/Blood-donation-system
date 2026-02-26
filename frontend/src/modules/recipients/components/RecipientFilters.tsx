import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_LEVEL_OPTIONS,
  type BloodGroup,
  type EmergencyLevel,
  type RecipientStatus,
} from "../types/recipient.types";

interface RecipientFiltersProps {
  search: string;
  bloodGroup: BloodGroup | "";
  emergencyLevel: EmergencyLevel | "";
  city: string;
  status: RecipientStatus | "";
  onSearchChange: (value: string) => void;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onEmergencyLevelChange: (value: EmergencyLevel | "") => void;
  onCityChange: (value: string) => void;
  onStatusChange: (value: RecipientStatus | "") => void;
  onReset: () => void;
}

export default function RecipientFilters({
  search,
  bloodGroup,
  emergencyLevel,
  city,
  status,
  onSearchChange,
  onBloodGroupChange,
  onEmergencyLevelChange,
  onCityChange,
  onStatusChange,
  onReset,
}: RecipientFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      <Input
        placeholder={t("recipients.filters.searchPlaceholder", "Search recipients")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      <Select
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={[
          { value: "", label: t("recipients.filters.allBloodGroups", "All Blood Groups") },
          ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
        ]}
      />

      <Select
        value={emergencyLevel}
        onChange={(event) => onEmergencyLevelChange(event.target.value as EmergencyLevel | "")}
        options={[
          { value: "", label: t("recipients.filters.allEmergency", "All Emergency Levels") },
          ...EMERGENCY_LEVEL_OPTIONS.map((level) => ({
            value: level,
            label: t(`recipients.emergency.${level}`, level),
          })),
        ]}
      />

      <Input
        placeholder={t("recipients.filters.cityPlaceholder", "City")}
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
      />

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as RecipientStatus | "")}
        options={[
          { value: "", label: t("recipients.filters.allStatuses", "All Statuses") },
          { value: "pending", label: t("recipients.status.pending", "Pending") },
          { value: "active", label: t("recipients.status.active", "Active") },
          { value: "blocked", label: t("recipients.status.blocked", "Blocked") },
        ]}
      />

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          {t("recipients.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}

