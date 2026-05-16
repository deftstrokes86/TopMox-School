import type { NotificationType } from "@prisma/client";

import type { AppRole } from "@/lib/auth/types";
import type { StatusTone } from "@/lib/constants/statuses";

export const NOTIFICATION_EMPTY_STATE_DESCRIPTION =
  "Updates about assessments, payments, lessons, homework, reports, and support will appear here.";

export type NotificationUiItem = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
};

export type NotificationDisplayItem = NotificationUiItem & {
  isUnread: boolean;
  statusLabel: "Unread" | "Read";
  statusTone: StatusTone;
  createdLabel: string;
};

type BuildNotificationModelInput = {
  currentUserId: string;
  role: AppRole;
  notifications: NotificationUiItem[];
  unreadCount: number;
  limit?: number;
};

export function getNotificationCenterHref(role: AppRole) {
  switch (role) {
    case "ADMIN":
      return "/admin/notifications";
    case "TUTOR":
      return "/tutor/notifications";
    case "PARENT":
    default:
      return "/parent/notifications";
  }
}

export function getNotificationCreatedLabel(
  createdAt: NotificationUiItem["createdAt"]
) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function canShowMarkAsReadAction(
  notification: NotificationUiItem,
  currentUserId: string
) {
  return notification.userId === currentUserId && notification.readAt === null;
}

export function getMarkAllNotificationsScope(currentUserId: string) {
  return {
    userId: currentUserId
  };
}

function toDisplayItem(notification: NotificationUiItem): NotificationDisplayItem {
  const isUnread = notification.readAt === null;

  return {
    ...notification,
    isUnread,
    statusLabel: isUnread ? "Unread" : "Read",
    statusTone: isUnread ? "info" : "neutral",
    createdLabel: getNotificationCreatedLabel(notification.createdAt)
  };
}

function buildBaseNotificationModel({
  currentUserId,
  role,
  notifications,
  unreadCount,
  limit
}: BuildNotificationModelInput) {
  const currentUserNotifications = notifications
    .filter((notification) => notification.userId === currentUserId)
    .map(toDisplayItem);

  const items =
    typeof limit === "number"
      ? currentUserNotifications.slice(0, limit)
      : currentUserNotifications;

  return {
    centerHref: getNotificationCenterHref(role),
    emptyStateDescription: NOTIFICATION_EMPTY_STATE_DESCRIPTION,
    hasUnread: unreadCount > 0,
    isEmpty: items.length === 0,
    items,
    unreadCount,
    unreadCountLabel: String(unreadCount)
  };
}

export function buildNotificationDropdownModel(
  input: BuildNotificationModelInput
) {
  return buildBaseNotificationModel({
    ...input,
    limit: input.limit ?? 5
  });
}

export function buildNotificationCenterModel(input: BuildNotificationModelInput) {
  return buildBaseNotificationModel(input);
}
