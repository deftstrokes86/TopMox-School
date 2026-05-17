import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { TUTOR_NAV_ITEMS } from "@/lib/constants/navigation";
import type { NotificationUiItem } from "@/lib/utils/notification-ui";
import {
  getCurrentUserUnreadNotificationCount,
  getRecentCurrentUserNotifications
} from "@/server/queries/notification.queries";

export default async function TutorLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardAccess("TUTOR");
  let notifications: NotificationUiItem[] = [];
  let unreadCount = 0;

  try {
    [notifications, unreadCount] = (await Promise.all([
      getRecentCurrentUserNotifications(5),
      getCurrentUserUnreadNotificationCount()
    ])) as [NotificationUiItem[], number];
  } catch (error) {
    console.error("Tutor notification summary failed to load:", error);
  }

  return (
    <DashboardShell
      shellTitle="Tutor Dashboard"
      navItems={TUTOR_NAV_ITEMS}
      topbarTitle="TopMox Tutor Workspace"
      topbarSubtitle="Protected tutor area. Teaching workflows will be implemented in later phases."
      topbarActions={
        <>
          <NotificationDropdown
            currentUserId={user.id}
            role={user.role}
            notifications={notifications}
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
