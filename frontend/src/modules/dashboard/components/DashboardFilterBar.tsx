import { CalendarDays, Filter, RefreshCw } from "lucide-react";

import { Button, Card, CardContent, Input, Select } from "@/components/ui";
import type { DashboardGroupBy } from "../types/dashboard.types";

interface DashboardFilterBarProps {
  dateFrom: string;
  dateTo: string;
  groupBy: DashboardGroupBy;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onGroupByChange: (value: DashboardGroupBy) => void;
  onReset: () => void;
}

export default function DashboardFilterBar({
  dateFrom,
  dateTo,
  groupBy,
  onDateFromChange,
  onDateToChange,
  onGroupByChange,
  onReset,
}: DashboardFilterBarProps) {
  return (
    <Card className="blood-card-accent">
      <CardContent className="mt-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Filter className="h-4 w-4 text-primary" />
            Time and Aggregation Filters
          </div>

          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onReset}>
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            onChange={(event) => onGroupByChange(event.target.value as DashboardGroupBy)}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

