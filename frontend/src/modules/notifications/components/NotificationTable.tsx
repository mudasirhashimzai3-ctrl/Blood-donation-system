import { Eye, EyeOff, Trash2 } from "lucide-react";

import { Card, CardContent, Pagination, PaginationInfo } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import type { NotificationListItem } from "../types/notification.types";
import NotificationStatusBadge from "./NotificationStatusBadge";
import NotificationTypeBadge from "./NotificationTypeBadge";

interface NotificationTableProps {
  notifications: NotificationListItem[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onToggleRead: (id: number, isRead: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function NotificationTable({
  notifications,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onToggleRead,
  onDelete,
}: NotificationTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardContent className="mt-0 p-0">
        {isLoading ? (
          <div className="p-8 text-sm text-text-secondary">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-sm text-text-secondary">No notifications found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Read
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-secondary">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`hover:bg-surface-hover ${notification.is_read ? "" : "bg-primary/5"}`}
                    >
                      <td className="px-4 py-3 text-sm text-text-primary">{notification.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <NotificationTypeBadge type={notification.type} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{notification.sent_via}</td>
                      <td className="px-4 py-3 text-sm">
                        <NotificationStatusBadge status={notification.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {notification.is_read ? "Read" : "Unread"}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {formatLocalDateTime(notification.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-info/10 hover:text-info"
                            onClick={() => onView(notification.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => onToggleRead(notification.id, !notification.is_read)}
                            title={notification.is_read ? "Mark unread" : "Mark read"}
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                            onClick={() => onDelete(notification.id)}
                            title="Remove"
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
