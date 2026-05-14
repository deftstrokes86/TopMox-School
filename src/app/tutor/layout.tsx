import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { TUTOR_NAV_ITEMS } from "@/lib/constants/navigation";

export default async function TutorLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardAccess("TUTOR");

  return (
    <DashboardShell
      shellTitle="Tutor Dashboard"
      navItems={TUTOR_NAV_ITEMS}
      topbarTitle="TopMox Tutor Workspace"
      topbarSubtitle="Protected tutor area. Teaching workflows will be implemented in later phases."
      topbarActions={
        <DashboardUserMenu name={user.name} email={user.email} role={user.role} />
      }
    >
      {children}
    </DashboardShell>
  );
}
