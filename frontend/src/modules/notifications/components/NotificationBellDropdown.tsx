import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import MarkAllReadButton from "./MarkAllReadButton";
import { useNotificationBell } from "../hooks/useNotificationBell";

interface NotificationBellDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function NotificationBellDropdown({
  isOpen,
  onToggle,
  onClose,
}: NotificationBellDropdownProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead, isMutating } = useNotificationBell();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            <MarkAllReadButton onClick={markAllRead} loading={isMutating} disabled={unreadCount === 0} />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-text-secondary">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`w-full border-b border-border p-4 text-left transition-colors hover:bg-surface-hover ${
                    notification.is_read ? "" : "bg-primary/5"
                  }`}
                  onClick={async () => {
                    if (!notification.is_read) {
                      await markAsRead(notification.id, true);
                    }
                    onClose();
                    navigate(`/notifications/${notification.id}`);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                    {!notification.is_read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{notification.message}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatLocalDateTime(notification.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border p-3">
            <button
              type="button"
              className="w-full rounded-lg bg-surface py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-hover"
              onClick={() => {
                onClose();
                navigate("/notifications");
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
