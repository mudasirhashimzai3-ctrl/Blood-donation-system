import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_LEVEL_OPTIONS,
  type BloodGroup,
  type EmergencyLevel,
} from "../types/recipient.types";

interface RecipientFiltersProps {
  bloodGroup: BloodGroup | "";
  emergencyLevel: EmergencyLevel | "";
  city: string;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onEmergencyLevelChange: (value: EmergencyLevel | "") => void;
  onCityChange: (value: string) => void;
  onReset: () => void;
}

export default function RecipientFilters({
  bloodGroup,
  emergencyLevel,
  city,
  onBloodGroupChange,
  onEmergencyLevelChange,
  onCityChange,
  onReset,
}: RecipientFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          {t("recipients.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
