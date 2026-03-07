import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import type { DonationListItem } from "../types/donation.types";
import DonationStatusBadge from "./DonationStatusBadge";

interface DonationTableProps {
  donations: DonationListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-10" />
        </div>
      ))}
    </div>
  );
}

export default function DonationTable({
  donations,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
}: DonationTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : donations.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("donations.list.empty", "No donations found")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.donor", "Donor")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.request", "Request")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.distance", "Distance")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.eta", "ETA")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.priorityScore", "Priority")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.notifiedAt", "Notified")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      {t("donations.table.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div>{donation.donor_name}</div>
                        <div className="text-xs text-text-secondary">{donation.donor_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">#{donation.request}</td>
                      <td className="px-4 py-3 text-sm">
                        <DonationStatusBadge status={donation.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donation.distance_km} km</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {donation.estimated_arrival_time ? `${donation.estimated_arrival_time} min` : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donation.priority_score}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {donation.notified_at ? formatLocalDateTime(donation.notified_at) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(donation.id)}
                            title={t("donations.actions.view", "View")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={page} pageSize={pageSize} totalItems={totalCount} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
