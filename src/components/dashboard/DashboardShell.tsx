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
    <div className="min-h-screen overflow-x-hidden bg-warm-ivory">
      <div className="container py-4 md:py-6">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="grid min-h-[78vh] min-w-0 lg:grid-cols-[16rem_1fr]">
            <DashboardSidebar title={shellTitle} items={navItems} />
            <div className="flex min-h-full min-w-0 flex-col">
              <DashboardTopbar
                title={topbarTitle}
                subtitle={topbarSubtitle}
                actions={topbarActions}
                mobileNav={
                  <MobileDashboardNav title={shellTitle} items={navItems} />
                }
              />
              <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
