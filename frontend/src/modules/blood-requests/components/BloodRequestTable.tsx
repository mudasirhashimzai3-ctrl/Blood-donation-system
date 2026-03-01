import { Eye, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import type { BloodRequestListItem } from "../types/bloodRequest.types";
import BloodRequestPriorityBadge from "./BloodRequestPriorityBadge";
import BloodRequestStatusBadge from "./BloodRequestStatusBadge";
import BloodRequestTypeBadge from "./BloodRequestTypeBadge";

interface BloodRequestTableProps {
  bloodRequests: BloodRequestListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRunAutoMatch: (id: number) => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

export default function BloodRequestTable({
  bloodRequests,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onRunAutoMatch,
}: BloodRequestTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : bloodRequests.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("bloodRequests.list.empty", "No blood requests found")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.recipient", "Recipient")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.hospital", "Hospital")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.bloodGroup", "Blood Group")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.type", "Type")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.priority", "Priority")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.deadline", "Deadline")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      {t("bloodRequests.table.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bloodRequests.map((bloodRequest) => (
                    <tr key={bloodRequest.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm text-text-primary">{bloodRequest.recipient_name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{bloodRequest.hospital_name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{bloodRequest.blood_group}</td>
                      <td className="px-4 py-3 text-sm">
                        <BloodRequestTypeBadge requestType={bloodRequest.request_type} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <BloodRequestPriorityBadge priority={bloodRequest.priority} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <BloodRequestStatusBadge status={bloodRequest.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {bloodRequest.response_deadline ? formatLocalDateTime(bloodRequest.response_deadline) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(bloodRequest.id)}
                            title={t("bloodRequests.actions.view", "View")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(bloodRequest.id)}
                            title={t("bloodRequests.actions.edit", "Edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-warning/10 hover:text-warning"
                            onClick={() => onRunAutoMatch(bloodRequest.id)}
                            title={t("bloodRequests.actions.runAutoMatch", "Run Auto Match")}
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                            onClick={() => onDelete(bloodRequest.id)}
                            title={t("bloodRequests.actions.delete", "Delete")}
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
