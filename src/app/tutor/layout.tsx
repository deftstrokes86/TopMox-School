import type { ReactNode } from "react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { TUTOR_NAV_ITEMS } from "@/lib/constants/navigation";

export default function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      shellTitle="Tutor Dashboard"
      navItems={TUTOR_NAV_ITEMS}
      topbarTitle="Tutor Dashboard Shell"
      topbarSubtitle="Foundation placeholder only. No lesson workflows yet."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Today's Lessons"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Assigned Students"
          value="--"
          context="Phase foundation placeholder"
        />
        <StatCard
          label="Reports Due"
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
