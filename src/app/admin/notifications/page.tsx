import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import type { NotificationUiItem } from "@/lib/utils/notification-ui";
import {
  getCurrentUserNotifications,
  getCurrentUserUnreadNotificationCount
} from "@/server/queries/notification.queries";

export default async function AdminNotificationsPage() {
  const user = await requireDashboardAccess("ADMIN");
  const [notifications, unreadCount] = await Promise.all([
    getCurrentUserNotifications({ take: 50 }),
    getCurrentUserUnreadNotificationCount()
  ]);

  return (
    <NotificationCenter
      currentUserId={user.id}
      role={user.role}
      notifications={notifications as NotificationUiItem[]}
      unreadCount={unreadCount}
    />
  );
}
