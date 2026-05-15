import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_STATUSES } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";
import { buildTutorReportListItem } from "@/lib/utils/tutor-report-ui";
import { getCurrentTutorReports } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type TutorReportsPageProps = {
  searchParams?: {
    status?: string;
  };
};

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function getSelectedStatus(value?: string) {
  return REPORT_STATUSES.find((status) => status === value);
}

export default async function TutorReportsPage({
  searchParams
}: TutorReportsPageProps) {
  const selectedStatus = getSelectedStatus(searchParams?.status);
  const reports = await getCurrentTutorReports();
  const visibleReports = selectedStatus
    ? reports.filter((report) => report.status === selectedStatus)
    : reports;
  const items = visibleReports.map(buildTutorReportListItem);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Progress Reports"
        description="Draft structured monthly updates for assigned students and submit them for TopMox admin review."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tutor/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              Draft Report
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          variant={!selectedStatus ? "default" : "outline"}
          size="sm"
        >
          <Link href="/tutor/reports">All</Link>
        </Button>
        {REPORT_STATUSES.map((status) => {
          const href = `/tutor/reports?status=${status}`;
          const label =
            status === "DRAFT"
              ? "Draft"
              : status === "REVIEW"
                ? "In Review"
                : "Published";

          return (
            <Button
              key={status}
              asChild
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
            >
              <Link href={href}>{label}</Link>
            </Button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No progress reports yet"
          description="No progress reports yet. Draft a report when a student has completed enough lessons for meaningful feedback."
          action={
            <Button asChild>
              <Link href="/tutor/reports/new">
                <FileText className="mr-2 h-4 w-4" />
                Draft a Progress Report
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "border-border/80 bg-white",
                item.canEdit ? "border-warm-gold/30" : ""
              )}
            >
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl text-deep-navy">
                      {item.studentName}
                    </CardTitle>
                    <p className="mt-1 text-sm text-text-secondary">
                      {item.classYearGroup} | {formatMonth(item.reportingMonth)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={item.status.label}
                      tone={item.status.tone}
                    />
                    <StatusBadge
                      label={item.progress.label}
                      tone={item.progress.tone}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Plan
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {item.planName}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Created
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link href={item.primaryHref}>
                    {item.actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
