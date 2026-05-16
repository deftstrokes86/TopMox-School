import { requireAuth } from "@/lib/auth";
import {
  type GetUserNotificationsOptions,
  getUserNotifications,
  getUserUnreadNotificationCount
} from "@/server/services/notification.service";

export async function getCurrentUserNotifications(
  options?: GetUserNotificationsOptions
) {
  const user = await requireAuth();

  return getUserNotifications(user.id, options);
}

export async function getCurrentUserUnreadNotificationCount() {
  const user = await requireAuth();

  return getUserUnreadNotificationCount(user.id);
}

export async function getRecentCurrentUserNotifications(limit = 5) {
  const user = await requireAuth();
  const take = Math.max(1, Math.min(limit, 20));

  return getUserNotifications(user.id, { take });
}
