import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import {
  BLOOD_GROUP_OPTIONS,
  BLOOD_REQUEST_STATUS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  type BloodGroup,
  type BloodRequestStatus,
  type RequestType,
} from "../types/bloodRequest.types";

interface BloodRequestFiltersProps {
  search: string;
  status: BloodRequestStatus | "";
  bloodGroup: BloodGroup | "";
  requestType: RequestType | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: BloodRequestStatus | "") => void;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onRequestTypeChange: (value: RequestType | "") => void;
  onReset: () => void;
}

export default function BloodRequestFilters({
  search,
  status,
  bloodGroup,
  requestType,
  onSearchChange,
  onStatusChange,
  onBloodGroupChange,
  onRequestTypeChange,
  onReset,
}: BloodRequestFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label={t("bloodRequests.filters.search", "Search")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t(
            "bloodRequests.filters.searchPlaceholder",
            "Search by hospital or assigned donor"
          )}
        />
        <Select
          label={t("bloodRequests.filters.bloodGroup", "Blood Group")}
          value={bloodGroup}
          onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
          options={[
            { value: "", label: t("bloodRequests.filters.allBloodGroups", "All Blood Groups") },
            ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
          ]}
        />
        <Select
          label={t("bloodRequests.filters.requestType", "Urgency")}
          value={requestType}
          onChange={(event) => onRequestTypeChange(event.target.value as RequestType | "")}
          options={[
            { value: "", label: t("bloodRequests.filters.allTypes", "All Request Types") },
            ...REQUEST_TYPE_OPTIONS.map((value) => ({
              value,
              label: t(`bloodRequests.type.${value}`, value),
            })),
          ]}
        />
        <Select
          label={t("bloodRequests.filters.status", "Status")}
          value={status}
          onChange={(event) => onStatusChange(event.target.value as BloodRequestStatus | "")}
          options={[
            { value: "", label: t("bloodRequests.filters.allStatuses", "All Statuses") },
            ...BLOOD_REQUEST_STATUS_OPTIONS.map((value) => ({
              value,
              label: t(`bloodRequests.status.${value}`, value),
            })),
          ]}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          {t("bloodRequests.filters.reset", "Reset")}
        </Button>
      </div>
    </div>
  );
}
