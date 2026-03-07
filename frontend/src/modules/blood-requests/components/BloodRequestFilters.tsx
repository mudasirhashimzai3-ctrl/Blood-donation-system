import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import {
  BLOOD_GROUP_OPTIONS,
  BLOOD_REQUEST_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  type BloodGroup,
  type BloodRequestStatus,
  type Priority,
  type RequestType,
} from "../types/bloodRequest.types";

interface BloodRequestFiltersProps {
  search: string;
  status: BloodRequestStatus | "";
  bloodGroup: BloodGroup | "";
  requestType: RequestType | "";
  priority: Priority | "";
  isActive: boolean | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: BloodRequestStatus | "") => void;
  onBloodGroupChange: (value: BloodGroup | "") => void;
  onRequestTypeChange: (value: RequestType | "") => void;
  onPriorityChange: (value: Priority | "") => void;
  onIsActiveChange: (value: boolean | null) => void;
  onReset: () => void;
}

export default function BloodRequestFilters({
  search,
  status,
  bloodGroup,
  requestType,
  priority,
  isActive,
  onSearchChange,
  onStatusChange,
  onBloodGroupChange,
  onRequestTypeChange,
  onPriorityChange,
  onIsActiveChange,
  onReset,
}: BloodRequestFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("bloodRequests.filters.searchPlaceholder", "Search by recipient or hospital")}
      />
      <Select
        value={bloodGroup}
        onChange={(event) => onBloodGroupChange(event.target.value as BloodGroup | "")}
        options={[
          { value: "", label: t("bloodRequests.filters.allBloodGroups", "All Blood Groups") },
          ...BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group })),
        ]}
      />
      <Select
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
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value as Priority | "")}
        options={[
          { value: "", label: t("bloodRequests.filters.allPriorities", "All Priorities") },
          ...PRIORITY_OPTIONS.map((value) => ({
            value,
            label: t(`bloodRequests.priority.${value}`, value),
          })),
        ]}
      />
      <Select
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
      <Select
        value={isActive === null ? "" : isActive ? "true" : "false"}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "true") {
            onIsActiveChange(true);
            return;
          }
          if (value === "false") {
            onIsActiveChange(false);
            return;
          }
          onIsActiveChange(null);
        }}
        options={[
          { value: "", label: "All Activity" },
          { value: "true", label: "Active Only" },
          { value: "false", label: "Inactive Only" },
        ]}
      />
      <Button variant="outline" onClick={onReset}>
        {t("bloodRequests.filters.reset", "Reset")}
      </Button>
    </div>
  );
}
