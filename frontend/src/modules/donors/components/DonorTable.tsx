import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import type { DonorListItem } from "../types/donor.types";
import DonorStatusBadge from "./DonorStatusBadge";

interface DonorTableProps {
  donors: DonorListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function DonorTable({
  donors,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DonorTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : donors.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("donors.list.empty", "No donors found")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.name", "Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.bloodGroup", "Blood Group")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.phone", "Phone")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.lastDonation", "Last Donation")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      {t("donors.table.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          {donor.profile_picture_url ? (
                            <img
                              src={donor.profile_picture_url}
                              alt={`${donor.first_name} ${donor.last_name}`}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-primary/10" />
                          )}
                          <span>
                            {donor.first_name} {donor.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.blood_group}</td>
                      <td className="px-4 py-3 text-sm">
                        <DonorStatusBadge status={donor.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{donor.phone}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {donor.last_donation_date || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(donor.id)}
                            title={t("donors.actions.view", "View")}
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(donor.id)}
                            title={t("donors.actions.edit", "Edit")}
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                            onClick={() => onDelete(donor.id)}
                            title={t("donors.actions.delete", "Delete")}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
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
