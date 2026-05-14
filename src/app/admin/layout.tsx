import type { ReactNode } from "react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      shellTitle="Admin Dashboard"
      navItems={ADMIN_NAV_ITEMS}
      topbarTitle="Admin Dashboard Shell"
      topbarSubtitle="Foundation placeholder only. Operations modules are deferred."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Parents"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Assessments"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Payments"
          value="--"
          context="Phase foundation placeholder"
        />
      </div>
      <div className="mt-5">
        <ActivityFeed />
      </div>
      <div className="mt-5">{children}</div>
    </DashboardShell>
  );
}
