import { CalendarDays, Filter, RefreshCw } from "lucide-react";

import { Button, Card, CardContent, Input, Select } from "@/components/ui";

interface ReportFiltersBarProps {
  dateFrom: string;
  dateTo: string;
  groupBy: "day" | "week" | "month";
  city: string;
  bloodGroup: string;
  requestType: string;
  priority: string;
  emergencyOnly: boolean;
  status: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onGroupByChange: (value: "day" | "week" | "month") => void;
  onCityChange: (value: string) => void;
  onBloodGroupChange: (value: string) => void;
  onRequestTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onEmergencyOnlyChange: (value: boolean) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const bloodGroupOptions = [
  { value: "", label: "All blood groups" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function ReportsFilterBar({
  dateFrom,
  dateTo,
  groupBy,
  city,
  bloodGroup,
  requestType,
  priority,
  emergencyOnly,
  status,
  onDateFromChange,
  onDateToChange,
  onGroupByChange,
  onCityChange,
  onBloodGroupChange,
  onRequestTypeChange,
  onPriorityChange,
  onEmergencyOnlyChange,
  onStatusChange,
  onReset,
}: ReportFiltersBarProps) {
  return (
    <Card variant="outlined" className="bg-surface/40">
      <CardContent className="mt-0 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Filter className="h-4 w-4" />
          Global Analytics Filters
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            leftIcon={<CalendarDays className="h-4 w-4" />}
          />
          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            leftIcon={<CalendarDays className="h-4 w-4" />}
          />
          <Select
            label="Group By"
            value={groupBy}
            onChange={(event) => onGroupByChange(event.target.value as "day" | "week" | "month")}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
          <Input
            label="City"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            placeholder="Filter by city"
          />

          <Select
            label="Blood Group"
            value={bloodGroup}
            onChange={(event) => onBloodGroupChange(event.target.value)}
            options={bloodGroupOptions}
          />
          <Select
            label="Request Type"
            value={requestType}
            onChange={(event) => onRequestTypeChange(event.target.value)}
            options={[
              { value: "", label: "All request types" },
              { value: "normal", label: "Normal" },
              { value: "urgent", label: "Urgent" },
              { value: "critical", label: "Critical" },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            options={[
              { value: "", label: "All priorities" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />
          <Input
            label="Status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            placeholder="Request/Donation status"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(event) => onEmergencyOnlyChange(event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Emergency only
          </label>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
