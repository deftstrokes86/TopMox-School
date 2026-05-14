import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { PARENT_NAV_ITEMS } from "@/lib/constants/navigation";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardAccess("PARENT");

  return (
    <DashboardShell
      shellTitle="Parent Dashboard"
      navItems={PARENT_NAV_ITEMS}
      topbarTitle="TopMox Parent Workspace"
      topbarSubtitle="Manage your family profile and prepare for the child assessment journey."
      topbarActions={
        <DashboardUserMenu name={user.name} email={user.email} role={user.role} />
      }
    >
      {children}
    </DashboardShell>
  );
}
