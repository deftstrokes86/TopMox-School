import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardAccess("ADMIN");

  return (
    <DashboardShell
      shellTitle="Admin Dashboard"
      navItems={ADMIN_NAV_ITEMS}
      topbarTitle="TopMox Admin Workspace"
      topbarSubtitle="Protected admin area. Workflow modules will be implemented in later phases."
      topbarActions={
        <DashboardUserMenu name={user.name} email={user.email} role={user.role} />
      }
    >
      {children}
    </DashboardShell>
  );
}
