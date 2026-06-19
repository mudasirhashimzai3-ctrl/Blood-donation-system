import { useTranslation } from "react-i18next";
import { Badge, Button, Card, CardContent, Skeleton } from "@components/ui";
import type { DonorCandidate } from "../types/dashboard.types";

interface DonorCandidateTableProps {
  donors: DonorCandidate[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  totalCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function DonorCandidateTable({
  donors,
  isLoading,
  isLoadingMore = false,
  totalCount,
  hasMore,
  onLoadMore,
}: DonorCandidateTableProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : donors.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("dashboard.donorSearch.noCompatibleDonors", "No compatible donors found inside the selected radius.")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.donor", "Donor")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.blood", "Blood")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.match", "Match")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.distance", "Distance")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.eligibility", "Eligibility")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.lastDonation", "Last Donation")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">{t("dashboard.donorSearch.table.phone", "Phone")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        {donor.first_name} {donor.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.blood_group}</td>
                      <td className="px-4 py-3">
                        <Badge variant={donor.match_type === "exact" ? "success" : "info"}>
                          {donor.match_type === "exact"
                            ? t("dashboard.donorSearch.match.exact", "Exact")
                            : t("dashboard.donorSearch.match.compatible", "Compatible")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.distance_km} KM</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Badge variant={donor.is_eligible ? "success" : "warning"}>
                            {donor.is_eligible
                              ? t("dashboard.donorSearch.eligibility.active", "Active")
                              : t("dashboard.donorSearch.eligibility.inactive", "Inactive / Not Eligible")}
                          </Badge>
                          {!donor.is_eligible && donor.eligible_from ? (
                            <p className="text-xs text-text-secondary">
                              {t("dashboard.donorSearch.eligibility.from", {
                                defaultValue: "Eligible from {{date}}",
                                date: donor.eligible_from,
                              })}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.last_donation_date ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">
                {t("dashboard.donorSearch.results", {
                  defaultValue: "Showing {{shown}} of {{total}} results",
                  shown: donors.length,
                  total: totalCount,
                })}
              </p>
              {hasMore ? (
                <Button type="button" variant="outline" loading={isLoadingMore} onClick={onLoadMore}>
                  {t("common.more", "More")}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
