import { Download, FileDown } from "lucide-react";

import { Button, Card, CardContent, CardHeader, Select } from "@/components/ui";
import type { CreateReportExportPayload, ReportTab, ReportsFilterParams } from "../types/report.types";

interface ReportExportPanelProps {
  isAdmin: boolean;
  activeTab: ReportTab;
  filters: ReportsFilterParams;
  loading: boolean;
  format: "csv" | "pdf";
  onFormatChange: (value: "csv" | "pdf") => void;
  onExport: (payload: CreateReportExportPayload) => void;
}

const reportTypeMap: Record<ReportTab, CreateReportExportPayload["report_type"]> = {
  requests: "request_analytics",
  donations: "donation_analytics",
  hospitals: "hospital_performance",
  emergency: "emergency_analysis",
  geography: "geographic_distance",
  system: "system_performance",
};

export default function ReportExportPanel({
  isAdmin,
  activeTab,
  filters,
  loading,
  format,
  onFormatChange,
  onExport,
}: ReportExportPanelProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title="Export Reports"
        subtitle="Queue CSV or PDF exports for the active analytics tab"
        action={<FileDown className="h-4 w-4 text-text-secondary" />}
      />
      <CardContent className="mt-0 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="w-full max-w-xs">
          <Select
            label="Format"
            value={format}
            onChange={(event) => onFormatChange(event.target.value as "csv" | "pdf")}
            options={[
              { value: "csv", label: "CSV" },
              { value: "pdf", label: "PDF" },
            ]}
          />
        </div>
        <Button
          leftIcon={<Download className="h-4 w-4" />}
          loading={loading}
          onClick={() =>
            onExport({
              report_type: reportTypeMap[activeTab],
              format,
              filters,
            })
          }
        >
          Queue Export
        </Button>
      </CardContent>
    </Card>
  );
}
