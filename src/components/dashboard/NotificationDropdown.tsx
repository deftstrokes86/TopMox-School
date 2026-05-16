import { Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth/types";
import {
  buildNotificationDropdownModel,
  canShowMarkAsReadAction,
  type NotificationUiItem
} from "@/lib/utils/notification-ui";
import { cn } from "@/lib/utils";
import { markNotificationReadFromFormAction } from "@/server/actions/notification.actions";

type NotificationDropdownProps = {
  currentUserId: string;
  role: AppRole;
  notifications: NotificationUiItem[];
  unreadCount: number;
};

export function NotificationDropdown({
  currentUserId,
  role,
  notifications,
  unreadCount
}: NotificationDropdownProps) {
  const model = buildNotificationDropdownModel({
    currentUserId,
    role,
    notifications,
    unreadCount
  });

  return (
    <details className="group relative">
      <summary
        className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary shadow-sm transition hover:border-primary/40 hover:text-primary [&::-webkit-details-marker]:hidden"
        aria-label="Open notifications"
      >
        <span className="relative">
          <Bell className="h-4 w-4" />
          {model.hasUnread ? (
            <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-white">
              {model.unreadCountLabel}
            </span>
          ) : null}
        </span>
        <span className="hidden sm:inline">Notifications</span>
      </summary>

      <div className="absolute right-0 z-40 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-soft-cream px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Notifications
            </p>
            <p className="text-xs text-text-secondary">
              Recent updates from TopMox
            </p>
          </div>
          {model.hasUnread ? (
            <StatusBadge
              label={`${model.unreadCountLabel} unread`}
              tone="info"
              className="px-2 py-0.5 text-[11px]"
            />
          ) : null}
        </div>

        {model.isEmpty ? (
          <div className="px-4 py-6">
            <p className="text-sm font-semibold text-text-primary">
              No notifications yet.
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {model.emptyStateDescription}
            </p>
          </div>
        ) : (
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {model.items.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "space-y-3 px-4 py-3",
                  notification.isUnread ? "bg-primary/5" : "bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        className="line-clamp-1 break-words text-sm font-semibold text-text-primary hover:text-primary"
                      >
                        {notification.title}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 break-words text-sm font-semibold text-text-primary">
                        {notification.title}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-text-secondary">
                      {notification.message}
                    </p>
                  </div>
                  <StatusBadge
                    label={notification.statusLabel}
                    tone={notification.statusTone}
                    className="shrink-0 px-2 py-0.5 text-[11px]"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 text-[11px] text-text-muted">
                  <span>{notification.createdLabel}</span>
                  {canShowMarkAsReadAction(notification, currentUserId) ? (
                    <form action={markNotificationReadFromFormAction}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border bg-white px-4 py-3">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={model.centerHref}>View all notifications</Link>
          </Button>
        </div>
      </div>
    </details>
  );
}
