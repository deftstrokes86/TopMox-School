import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm text-text-secondary md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
