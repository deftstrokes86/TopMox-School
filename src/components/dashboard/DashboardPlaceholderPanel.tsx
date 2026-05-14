import type { AppRole } from "@/lib/auth/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";

type DashboardPlaceholderPanelProps = {
  title: string;
  message: string;
  role: AppRole;
  userName: string;
  userEmail: string;
};

export function DashboardPlaceholderPanel({
  title,
  message,
  role,
  userName,
  userEmail
}: DashboardPlaceholderPanelProps) {
  return (
    <section className="space-y-5">
      <PageHeader title={title} description={message} />
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-text-primary">
            Signed-in Account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This is a protected dashboard placeholder for Phase 3C.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
              </p>
              <p className="mt-1 font-medium text-text-primary">{userName}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Email
              </p>
              <p className="mt-1 font-medium text-text-primary">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Role:
            </span>
            <StatusBadge label={role} tone="info" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
