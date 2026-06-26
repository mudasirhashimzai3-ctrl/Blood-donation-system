import { CalendarDays, RefreshCw, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select, Switch } from "@/components/ui";
import { BLOOD_GROUP_OPTIONS, REQUEST_TYPE_OPTIONS } from "@/modules/blood-requests/types/bloodRequest.types";
import type { ReportGroupBy, ReportsFilterParams, ReportTab } from "../types/report.types";

interface ReportsFilterBarProps {
  dateFrom: string;
  dateTo: string;
  groupBy: "day" | "week" | "month";
  city: string;
  bloodGroup: string;
  requestType: string;
  emergencyOnly: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onGroupByChange: (value: "day" | "week" | "month") => void;
  onCityChange: (value: string) => void;
  onBloodGroupChange: (value: string) => void;
  onRequestTypeChange: (value: string) => void;
  onEmergencyOnlyChange: (value: boolean) => void;
  onReset: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTab?: ReportTab;
  filters?: ReportsFilterParams;
}

const groupByOptions: Array<{ value: ReportGroupBy; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export default function ReportsFilterBar({
  dateFrom,
  dateTo,
  groupBy,
  city,
  bloodGroup,
  requestType,
  emergencyOnly,
  onDateFromChange,
  onDateToChange,
  onGroupByChange,
  onCityChange,
  onBloodGroupChange,
  onRequestTypeChange,
  onEmergencyOnlyChange,
  onReset,
  onRefresh,
  isRefreshing = false,
  activeTab,
  filters,
}: ReportsFilterBarProps) {
  const { t } = useTranslation();
  const tabLabel = activeTab ? t(`reports.tabs.${activeTab}`, activeTab) : t("reports.filters.allTabs", "Reports");
  const appliedFilterCount = [
    filters?.city,
    filters?.blood_group,
    filters?.request_type,
    filters?.emergency_only,
  ].filter(Boolean).length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {t("reports.filters.title", "Report Filters")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("reports.filters.context", "{{tabLabel}} view", { tabLabel })}
            {appliedFilterCount > 0 ? ` · ${appliedFilterCount} ${t("reports.filters.applied", "applied")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>
            {t("common.reset", "Reset")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={onRefresh}
          >
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          type="date"
          label={t("reports.filters.dateFrom", "Date From")}
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          leftIcon={<CalendarDays className="h-4 w-4" />}
        />
        <Input
          type="date"
          label={t("reports.filters.dateTo", "Date To")}
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          leftIcon={<CalendarDays className="h-4 w-4" />}
        />
        <Select
          label={t("reports.filters.groupBy", "Group By")}
          value={groupBy}
          options={groupByOptions.map((option) => ({
            value: option.value,
            label: t(`reports.filters.groupByOptions.${option.value}`, option.label),
          }))}
          onChange={(event) => onGroupByChange(event.target.value as ReportGroupBy)}
        />
        <Input
          label={t("reports.filters.city", "City")}
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder={t("reports.filters.cityPlaceholder", "Filter by city")}
        />
        <Select
          label={t("reports.filters.bloodGroup", "Blood Group")}
          value={bloodGroup}
          options={[
            { value: "", label: t("reports.filters.allBloodGroups", "All blood groups") },
            ...BLOOD_GROUP_OPTIONS.map((value) => ({ value, label: value })),
          ]}
          onChange={(event) => onBloodGroupChange(event.target.value)}
        />
        <Select
          label={t("reports.filters.requestType", "Request Type")}
          value={requestType}
          options={[
            { value: "", label: t("reports.filters.allRequestTypes", "All request types") },
            ...REQUEST_TYPE_OPTIONS.map((value) => ({
              value,
              label: t(`bloodRequests.type.${value}`, value),
            })),
          ]}
          onChange={(event) => onRequestTypeChange(event.target.value)}
        />
        <div className="flex items-end">
          <Switch
            label={t("reports.filters.emergencyOnly", "Emergency only")}
            description={t("reports.filters.emergencyOnlyDescription", "Urgent and critical requests")}
            checked={emergencyOnly}
            onChange={(event) => onEmergencyOnlyChange(event.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}
