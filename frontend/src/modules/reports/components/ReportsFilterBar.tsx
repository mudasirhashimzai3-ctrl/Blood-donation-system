import type { ReportsFilterParams, ReportTab } from "../types/report.types";

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
  activeTab?: ReportTab;
  filters?: ReportsFilterParams;
}

export default function ReportsFilterBar(_props: ReportsFilterBarProps) {
  return null;
}
