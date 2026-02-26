import { Ban, Eye, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, Pagination, PaginationInfo, Skeleton } from "@components/ui";
import type { HospitalListItem } from "../types/hospital.types";
import HospitalStatusBadge from "./HospitalStatusBadge";

interface HospitalTableProps {
  hospitals: HospitalListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, isActive: boolean) => void;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function HospitalTable({
  hospitals,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: HospitalTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <LoadingRows />
        ) : hospitals.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            {t("hospitals.list.empty", "No hospitals found")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.name", "Hospital Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.phone", "Phone")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.email", "Email")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.city", "City")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      {t("hospitals.table.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 text-sm text-text-primary">{hospital.name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{hospital.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{hospital.email || "-"}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{hospital.city}</td>
                      <td className="px-4 py-3 text-sm">
                        <HospitalStatusBadge isActive={hospital.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(hospital.id)}
                            title={t("hospitals.actions.view", "View")}
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(hospital.id)}
                            title={t("hospitals.actions.edit", "Edit")}
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                            onClick={() => onDelete(hospital.id)}
                            title={t("hospitals.actions.delete", "Delete")}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-warning/10 hover:text-warning"
                            onClick={() => onToggleStatus(hospital.id, hospital.is_active)}
                            title={
                              hospital.is_active
                                ? t("hospitals.actions.deactivate", "Deactivate")
                                : t("hospitals.actions.activate", "Activate")
                            }
                            type="button"
                          >
                            {hospital.is_active ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
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

