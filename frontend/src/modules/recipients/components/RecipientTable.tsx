import { Ban, Eye, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import type { RecipientListItem } from "../types/recipient.types";
import EmergencyLevelBadge from "./EmergencyLevelBadge";
import RecipientStatusBadge from "./RecipientStatusBadge";

interface RecipientTableProps {
  recipients: RecipientListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleBlock: (id: number, currentStatus: RecipientListItem["status"]) => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function RecipientTable({
  recipients,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleBlock,
}: RecipientTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : recipients.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("recipients.list.empty", "No recipients found")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.fullName", "Full Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.phone", "Phone Number")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.bloodGroup", "Required Blood Group")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.hospital", "Hospital Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.emergencyLevel", "Emergency Level")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.city", "City")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      {t("recipients.table.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm text-text-primary">{recipient.full_name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{recipient.phone}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{recipient.required_blood_group}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{recipient.hospital_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <EmergencyLevelBadge level={recipient.emergency_level} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{recipient.city}</td>
                      <td className="px-4 py-3 text-sm">
                        <RecipientStatusBadge status={recipient.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(recipient.id)}
                            title={t("recipients.actions.view", "View")}
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(recipient.id)}
                            title={t("recipients.actions.edit", "Edit")}
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                            onClick={() => onDelete(recipient.id)}
                            title={t("recipients.actions.delete", "Delete")}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-warning/10 hover:text-warning"
                            onClick={() => onToggleBlock(recipient.id, recipient.status)}
                            title={
                              recipient.status === "blocked"
                                ? t("recipients.actions.unblock", "Unblock")
                                : t("recipients.actions.block", "Block")
                            }
                            type="button"
                          >
                            {recipient.status === "blocked" ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
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

