import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  context?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, context, icon }: StatCardProps) {
  return (
    <Card className="border-border/90">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            {label}
          </p>
          {icon}
        </div>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        {context ? (
          <p className="text-xs text-text-secondary">{context}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
