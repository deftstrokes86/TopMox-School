import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function DashboardTopbar({
  title,
  subtitle,
  actions,
  className
}: DashboardTopbarProps) {
  return (
    <header
      className={cn("border-b border-border bg-white px-5 py-4", className)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary md:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
