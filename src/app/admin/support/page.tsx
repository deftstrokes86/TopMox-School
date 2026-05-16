import type { SupportStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, LifeBuoy, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_STATUSES } from "@/lib/validations/support.schema";
import { getSupportStatusMeta } from "@/lib/utils/support-ui";
import { getAdminSupportRequests } from "@/server/queries/support.queries";

export const dynamic = "force-dynamic";

type AdminSupportPageProps = {
  searchParams: {
    status?: string;
    search?: string;
  };
};

type AdminSupportItem = Awaited<ReturnType<typeof getAdminSupportRequests>>[number];

function parseStatus(value?: string): SupportStatus | undefined {
  return SUPPORT_STATUSES.includes(value as SupportStatus)
    ? (value as SupportStatus)
    : undefined;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function FilterControls({
  status,
  search
}: {
  status?: string;
  search?: string;
}) {
  return (
    <Card className="border-royal-blue/20">
      <CardContent className="p-5">
        <form className="grid gap-3 lg:grid-cols-[1fr_0.7fr_auto]" action="/admin/support">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent, child, or issue
            </span>
            <input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search support requests"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {SUPPORT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {getSupportStatusMeta(option).label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full lg:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button asChild variant="outline" className="w-full lg:w-auto">
              <Link href="/admin/support">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SupportCard({ supportRequest }: { supportRequest: AdminSupportItem }) {
  const status = getSupportStatusMeta(supportRequest.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {supportRequest.subject}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {supportRequest.parent.user.name} |{" "}
              {supportRequest.parent.user.email}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Child
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {supportRequest.student?.fullName ?? "Not linked"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent location
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {supportRequest.parent.country}
            </p>
            <p className="text-xs text-text-muted">
              {supportRequest.parent.timezone}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Created
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(supportRequest.createdAt)}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
          {supportRequest.message}
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/admin/support/${supportRequest.id}`}>
            View Support Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function AdminSupportPage({
  searchParams
}: AdminSupportPageProps) {
  const supportRequests = await getAdminSupportRequests({
    status: parseStatus(searchParams.status),
    search: searchParams.search
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Support Requests"
        description="Review parent support requests, update statuses, reply clearly, and keep internal communication history."
      />

      <FilterControls
        status={searchParams.status}
        search={searchParams.search}
      />

      {supportRequests.length === 0 ? (
        <EmptyState
          title="No support requests found"
          description="Parent support requests will appear here for admin review and follow-up."
          action={
            <Button asChild>
              <Link href="/admin">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Back to Admin Overview
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {supportRequests.map((supportRequest) => (
            <SupportCard
              key={supportRequest.id}
              supportRequest={supportRequest}
            />
          ))}
        </div>
      )}
    </section>
  );
}
