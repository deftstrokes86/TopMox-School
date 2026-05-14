import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { MobileDashboardNav } from "@/components/dashboard/MobileDashboardNav";
import type { NavigationItem } from "@/lib/constants/navigation";

type DashboardShellProps = {
  shellTitle: string;
  navItems: NavigationItem[];
  topbarTitle: string;
  topbarSubtitle?: string;
  topbarActions?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  shellTitle,
  navItems,
  topbarTitle,
  topbarSubtitle,
  topbarActions,
  children
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-warm-ivory">
      <div className="container py-6">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="grid min-h-[78vh] lg:grid-cols-[16rem_1fr]">
            <DashboardSidebar title={shellTitle} items={navItems} />
            <div className="flex min-h-full flex-col">
              <DashboardTopbar
                title={topbarTitle}
                subtitle={topbarSubtitle}
                actions={topbarActions}
              />
              <main className="flex-1 p-5 pb-24 md:p-6 md:pb-24 lg:pb-6">
                {children}
              </main>
              <MobileDashboardNav items={navItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
