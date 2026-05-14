import type { ReactNode } from "react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { PARENT_NAV_ITEMS } from "@/lib/constants/navigation";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      shellTitle="Parent Dashboard"
      navItems={PARENT_NAV_ITEMS}
      topbarTitle="Parent Dashboard Shell"
      topbarSubtitle="Foundation placeholder only. No business workflows yet."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active Children"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Upcoming Lessons"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Reports"
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
