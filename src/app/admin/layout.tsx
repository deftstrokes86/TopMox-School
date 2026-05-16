import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/navigation";
import type { NotificationUiItem } from "@/lib/utils/notification-ui";
import {
  getCurrentUserUnreadNotificationCount,
  getRecentCurrentUserNotifications
} from "@/server/queries/notification.queries";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardAccess("ADMIN");
  const [notifications, unreadCount] = await Promise.all([
    getRecentCurrentUserNotifications(5),
    getCurrentUserUnreadNotificationCount()
  ]);

  return (
    <DashboardShell
      shellTitle="Admin Dashboard"
      navItems={ADMIN_NAV_ITEMS}
      topbarTitle="TopMox Admin Workspace"
      topbarSubtitle="Protected admin area. Workflow modules will be implemented in later phases."
      topbarActions={
        <>
          <NotificationDropdown
            currentUserId={user.id}
            role={user.role}
            notifications={notifications as NotificationUiItem[]}
            unreadCount={unreadCount}
          />
          <DashboardUserMenu
            name={user.name}
            email={user.email}
            role={user.role}
          />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
