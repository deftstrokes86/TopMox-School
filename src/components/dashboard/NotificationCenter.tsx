import { Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth/types";
import {
  buildNotificationCenterModel,
  canShowMarkAsReadAction,
  type NotificationUiItem
} from "@/lib/utils/notification-ui";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadFromFormAction,
  markNotificationReadFromFormAction
} from "@/server/actions/notification.actions";

type NotificationCenterProps = {
  currentUserId: string;
  role: AppRole;
  notifications: NotificationUiItem[];
  unreadCount: number;
};

export function NotificationCenter({
  currentUserId,
  role,
  notifications,
  unreadCount
}: NotificationCenterProps) {
  const model = buildNotificationCenterModel({
    currentUserId,
    role,
    notifications,
    unreadCount
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-card md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Bell className="h-3.5 w-3.5" />
            In-app updates
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-text-primary">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Keep track of assessments, payments, lessons, homework, reports, and
            support updates in one calm feed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            label={`${model.unreadCountLabel} unread`}
            tone={model.hasUnread ? "info" : "neutral"}
          />
          {model.hasUnread ? (
            <form action={markAllNotificationsReadFromFormAction}>
              <Button type="submit" size="sm" variant="outline">
                Mark all as read
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {model.isEmpty ? (
        <EmptyState
          title="No notifications yet."
          description={model.emptyStateDescription}
        />
      ) : (
        <div className="space-y-3">
          {model.items.map((notification) => (
            <article
              key={notification.id}
              className={cn(
                "rounded-xl border border-border bg-white p-5 shadow-card",
                notification.isUnread ? "border-primary/30 bg-primary/5" : ""
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={notification.statusLabel}
                      tone={notification.statusTone}
                    />
                    <span className="text-xs text-text-muted">
                      {notification.createdLabel}
                    </span>
                  </div>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className="mt-3 block break-words text-lg font-semibold text-text-primary hover:text-primary"
                    >
                      {notification.title}
                    </Link>
                  ) : (
                    <h3 className="mt-3 break-words text-lg font-semibold text-text-primary">
                      {notification.title}
                    </h3>
                  )}
                  <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-text-secondary">
                    {notification.message}
                  </p>
                </div>
                {canShowMarkAsReadAction(notification, currentUserId) ? (
                  <form action={markNotificationReadFromFormAction}>
                    <input
                      type="hidden"
                      name="notificationId"
                      value={notification.id}
                    />
                    <Button type="submit" size="sm" variant="outline">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as read
                    </Button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
