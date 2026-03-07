import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components";
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import useCan from "@/hooks/useCan";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import ReportExportJobsTable from "../components/ReportExportJobsTable";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsFilterBar from "../components/ReportsFilterBar";
import ReportsTabPanels from "../components/ReportsTabPanels";
import { useReportExport } from "../hooks/useReportExport";
import { useReportFilters } from "../hooks/useReportFilters";
import { useReportTabs } from "../hooks/useReportTabs";
import {
  useDonationAnalytics,
  useEmergencyAnalysis,
  useGeographicDistance,
  useHospitalPerformance,
  useRequestAnalytics,
  useSystemPerformance,
} from "../queries/useReportQueries";
import type { ReportTab } from "../types/report.types";

const tabConfig: Array<{ id: ReportTab; label: string }> = [
  { id: "requests", label: "Requests" },
  { id: "donations", label: "Donations" },
  { id: "hospitals", label: "Hospitals" },
  { id: "emergency", label: "Emergency" },
  { id: "geography", label: "Geography" },
  { id: "system", label: "System" },
];

export default function ReportsWorkspacePage() {
  const { t } = useTranslation();
  const { can } = useCan();
  const userRole = useUserStore((state) => state.userProfile?.role);
  const isAdmin = userRole === "admin";

  const { activeTab, setActiveTab } = useReportTabs();
  const {
    dateFrom,
    dateTo,
    groupBy,
    city,
    bloodGroup,
    requestType,
    priority,
    emergencyOnly,
    status,
    setDateFrom,
    setDateTo,
    setGroupBy,
    setCity,
    setBloodGroup,
    setRequestType,
    setPriority,
    setEmergencyOnly,
    setStatus,
    resetFilters,
    queryParams,
  } = useReportFilters();

  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

  const requestQuery = useRequestAnalytics(queryParams, { enabled: activeTab === "requests" && can("reports") });
  const donationQuery = useDonationAnalytics(queryParams, { enabled: activeTab === "donations" && can("reports") });
  const hospitalQuery = useHospitalPerformance(queryParams, { enabled: activeTab === "hospitals" && can("reports") });
  const emergencyQuery = useEmergencyAnalysis(queryParams, { enabled: activeTab === "emergency" && can("reports") });
  const geographyQuery = useGeographicDistance(queryParams, { enabled: activeTab === "geography" && can("reports") });
  const systemQuery = useSystemPerformance(queryParams, { enabled: activeTab === "system" && can("reports") });

  const { createExport, downloadExport, jobs } = useReportExport(isAdmin && can("reports"));

  const activeFilters = useMemo(
    () => ({
      ...queryParams,
      cache: isAdmin ? ("false" as const) : ("true" as const),
    }),
    [isAdmin, queryParams]
  );

  if (!can("reports")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("reports.errors.noPermission", "You do not have permission to access reports.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("reports.title", "Analytical Reports")}
        subtitle={t(
          "reports.subtitle",
          "Unified analytics for requests, donations, hospitals, emergency response, geography, and system health"
        )}
      />

      <ReportsFilterBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        groupBy={groupBy}
        city={city}
        bloodGroup={bloodGroup}
        requestType={requestType}
        priority={priority}
        emergencyOnly={emergencyOnly}
        status={status}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onGroupByChange={setGroupBy}
        onCityChange={setCity}
        onBloodGroupChange={setBloodGroup}
        onRequestTypeChange={setRequestType}
        onPriorityChange={setPriority}
        onEmergencyOnlyChange={setEmergencyOnly}
        onStatusChange={setStatus}
        onReset={resetFilters}
      />

      <ReportExportPanel
        isAdmin={isAdmin}
        activeTab={activeTab}
        filters={activeFilters}
        format={exportFormat}
        onFormatChange={setExportFormat}
        loading={createExport.isPending}
        onExport={(payload) => createExport.mutate(payload)}
      />

      <Card>
        <CardContent className="mt-0">
          <Tabs defaultValue={activeTab} className="space-y-4" onChange={(value) => setActiveTab(value as ReportTab)}>
            <TabsList className="scrollbar-hide flex w-full overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabConfig.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <ReportsTabPanels
                  activeTab={tab.id}
                  request={{
                    data: requestQuery.data,
                    isLoading: requestQuery.isLoading,
                    error: requestQuery.error,
                    refetch: requestQuery.refetch,
                  }}
                  donation={{
                    data: donationQuery.data,
                    isLoading: donationQuery.isLoading,
                    error: donationQuery.error,
                    refetch: donationQuery.refetch,
                  }}
                  hospital={{
                    data: hospitalQuery.data,
                    isLoading: hospitalQuery.isLoading,
                    error: hospitalQuery.error,
                    refetch: hospitalQuery.refetch,
                  }}
                  emergency={{
                    data: emergencyQuery.data,
                    isLoading: emergencyQuery.isLoading,
                    error: emergencyQuery.error,
                    refetch: emergencyQuery.refetch,
                  }}
                  geography={{
                    data: geographyQuery.data,
                    isLoading: geographyQuery.isLoading,
                    error: geographyQuery.error,
                    refetch: geographyQuery.refetch,
                  }}
                  system={{
                    data: systemQuery.data,
                    isLoading: systemQuery.isLoading,
                    error: systemQuery.error,
                    refetch: systemQuery.refetch,
                  }}
                  onResetFilters={resetFilters}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {isAdmin ? (
        <ReportExportJobsTable
          jobs={jobs.data?.results ?? []}
          loading={jobs.isLoading}
          downloading={downloadExport.isPending}
          onDownload={(job) =>
            downloadExport.mutate({
              id: job.id,
              filename: `report_export_${job.id}.${job.file_format}`,
            })
          }
        />
      ) : null}
    </div>
  );
}
