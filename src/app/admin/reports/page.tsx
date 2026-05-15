import type { ReportStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_STATUSES } from "@/lib/constants/statuses";
import {
  buildAdminReportListItem,
  getAdminReportDashboardSummary,
  getAdminReportStatusMeta
} from "@/lib/utils/admin-report-ui";
import {
  getAdminReports,
  getReportsDueForAdmin
} from "@/server/queries/report.queries";
import { getActiveTutors } from "@/server/queries/tutor.queries";

export const dynamic = "force-dynamic";

type AdminReportsPageProps = {
  searchParams: {
    status?: string;
    tutorId?: string;
    studentId?: string;
    reportingMonth?: string;
  };
};

function parseReportStatus(value?: string): ReportStatus | undefined {
  return REPORT_STATUSES.includes(value as ReportStatus)
    ? (value as ReportStatus)
    : undefined;
}

function parseReportingMonth(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}-01T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

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

export default async function AdminReportsPage({
  searchParams
}: AdminReportsPageProps) {
  const [reports, allReports, reportsDue, tutors] = await Promise.all([
    getAdminReports({
      status: parseReportStatus(searchParams.status),
      tutorId: searchParams.tutorId || undefined,
      studentId: searchParams.studentId || undefined,
      reportingMonth: parseReportingMonth(searchParams.reportingMonth)
    }),
    getAdminReports(),
    getReportsDueForAdmin(),
    getActiveTutors()
  ]);
  const summary = getAdminReportDashboardSummary(allReports, reportsDue);
  const items = reports.map(buildAdminReportListItem);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Progress Reports"
        description="Review tutor-submitted reports, return drafts for edits, and publish parent-ready progress updates."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin">
              <FileText className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Draft"
          value={String(summary.draftReports)}
          context="Tutor reports still being prepared."
        />
        <StatCard
          label="In Review"
          value={String(summary.reportsInReview)}
          context="Reports ready for admin editorial review."
        />
        <StatCard
          label="Published"
          value={String(summary.publishedReports)}
          context="Reports visible to parents."
        />
      </div>

      <Card className="border-royal-blue/20">
        <CardContent className="p-5">
          <form
            className="grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr_0.8fr_auto]"
            action="/admin/reports"
          >
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Status
              </span>
              <select
                name="status"
                defaultValue={searchParams.status ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All</option>
                {REPORT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getAdminReportStatusMeta(status).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Tutor
              </span>
              <select
                name="tutorId"
                defaultValue={searchParams.tutorId ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All tutors</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Student ID
              </span>
              <input
                name="studentId"
                defaultValue={searchParams.studentId ?? ""}
                placeholder="Optional exact student id"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Month
              </span>
              <input
                type="month"
                name="reportingMonth"
                defaultValue={searchParams.reportingMonth ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full lg:w-auto">
                Filter
              </Button>
              <Button asChild variant="outline" className="w-full lg:w-auto">
                <Link href="/admin/reports">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title="No progress reports found"
          description="Tutor progress reports will appear here after tutors draft and submit them for TopMox admin review."
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border/80 bg-white">
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
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Parent
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {item.parentName}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Tutor
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {item.tutorName}
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
                  <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Published
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {item.publishedAt ? formatDate(item.publishedAt) : "Not yet"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={item.primaryHref}>
                      {item.actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
