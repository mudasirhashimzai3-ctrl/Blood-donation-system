import { Badge, Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import type { DonorCandidate } from "../types/dashboard.types";

interface DonorCandidateTableProps {
  donors: DonorCandidate[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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
  totalCount,
  page,
  pageSize,
  onPageChange,
}: DonorCandidateTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : donors.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            No compatible donors found inside the selected radius.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Donor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Blood</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Match</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Distance</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Eligibility</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Last Donation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Phone</th>
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
                          {donor.match_type === "exact" ? "Exact" : "Compatible"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.distance_km} KM</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Badge variant={donor.is_eligible ? "success" : "warning"}>
                            {donor.is_eligible ? "Active and Eligible" : "Inactive / Not Eligible"}
                          </Badge>
                          {!donor.is_eligible && donor.eligible_from ? (
                            <p className="text-xs text-text-secondary">Eligible from {donor.eligible_from}</p>
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
              <PaginationInfo currentPage={page} pageSize={pageSize} totalItems={totalCount} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
