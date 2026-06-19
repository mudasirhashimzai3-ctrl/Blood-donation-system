import { Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Card, CardContent } from "@components/ui";
import DonorCandidateTable from "./DonorCandidateTable";
import DonorSearchFilters from "./DonorSearchFilters";
import { useDashboardDonorSearch } from "../hooks/useDashboardDonorSearch";
import { useDashboardDonorCandidates } from "../queries/useDashboardQueries";
import type { DashboardBloodRequestOption, DonorCandidate } from "../types/dashboard.types";

interface DonorSearchPanelProps {
  requests: DashboardBloodRequestOption[];
  requestsLoading?: boolean;
  title: string;
  subtitle: string;
  emptyRequestsMessage: string;
  showSettingsButton?: boolean;
  showBloodRequestFilter?: boolean;
  onSettingsClick?: () => void;
}

export default function DonorSearchPanel({
  requests,
  requestsLoading = false,
  title,
  subtitle,
  emptyRequestsMessage,
  showSettingsButton = false,
  showBloodRequestFilter = true,
  onSettingsClick,
}: DonorSearchPanelProps) {
  const { t } = useTranslation();
  const search = useDashboardDonorSearch(requests);
  const [donors, setDonors] = useState<DonorCandidate[]>([]);
  const querySignature = useMemo(
    () =>
      JSON.stringify({
        blood_request_id: search.queryParams.blood_request_id ?? null,
        blood_group: search.queryParams.blood_group ?? "",
        radius_km: search.queryParams.radius_km,
        page_size: search.queryParams.page_size,
      }),
    [
      search.queryParams.blood_group,
      search.queryParams.blood_request_id,
      search.queryParams.page_size,
      search.queryParams.radius_km,
    ]
  );

  const candidatesQuery = useDashboardDonorCandidates(search.queryParams, {
    enabled: Boolean(search.queryParams.blood_request_id),
  });
  const totalCandidates = candidatesQuery.data?.count ?? 0;
  const hasMore = donors.length < totalCandidates;

  useEffect(() => {
    setDonors([]);
  }, [querySignature]);

  useEffect(() => {
    const nextResults = candidatesQuery.data?.results;
    if (!nextResults) {
      return;
    }

    if (search.page === 1) {
      setDonors(nextResults);
      return;
    }

    setDonors((current) => {
      const seen = new Set(current.map((donor) => donor.id));
      return [...current, ...nextResults.filter((donor) => !seen.has(donor.id))];
    });
  }, [candidatesQuery.data?.results, search.page]);

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
              <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
            {showSettingsButton ? (
              <Button
                variant="outline"
                onClick={onSettingsClick}
                leftIcon={<Settings className="h-4 w-4" />}
              >
                {t("dashboard.donorSearch.configureRadius", "Configure Radius")}
              </Button>
            ) : null}
          </div>

          {requestsLoading ? (
            <p className="text-sm text-text-secondary">
              {t("dashboard.donorSearch.loadingRequests", "Loading active blood requests...")}
            </p>
          ) : null}

          {!requestsLoading && requests.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
              {emptyRequestsMessage}
            </p>
          ) : (
            <DonorSearchFilters
              requests={requests}
              bloodRequestId={search.bloodRequestId}
              bloodGroup={search.bloodGroup || search.selectedRequest?.blood_group || ""}
              radiusKm={search.radiusKm}
              showBloodRequestFilter={showBloodRequestFilter}
              onBloodRequestChange={search.setBloodRequestId}
              onBloodGroupChange={search.setBloodGroup}
              onRadiusChange={search.setRadiusKm}
              onReset={search.reset}
            />
          )}
        </CardContent>
      </Card>

      {requests.length > 0 ? (
        <>
          {candidatesQuery.error ? (
            <Card>
              <CardContent className="text-sm text-error">
                {t("dashboard.donorSearch.loadFailed", "Failed to load donor candidates.")}
              </CardContent>
            </Card>
          ) : null}

          <DonorCandidateTable
            donors={donors}
            isLoading={candidatesQuery.isLoading || (candidatesQuery.isFetching && donors.length === 0)}
            isLoadingMore={candidatesQuery.isFetching && donors.length > 0}
            totalCount={totalCandidates}
            hasMore={hasMore}
            onLoadMore={() => search.setPage(search.page + 1)}
          />
        </>
      ) : null}
    </>
  );
}
