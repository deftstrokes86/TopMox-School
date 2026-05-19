import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  mobileNav?: ReactNode;
  className?: string;
};

export function DashboardTopbar({
  title,
  subtitle,
  actions,
  mobileNav,
  className
}: DashboardTopbarProps) {
  return (
    <header
      className={cn("border-b border-border bg-white px-4 py-4 md:px-5", className)}
    >
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {mobileNav ? <div className="shrink-0 lg:hidden">{mobileNav}</div> : null}
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold text-text-primary md:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex max-w-full flex-wrap gap-2 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
