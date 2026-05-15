import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildParentReportListItem } from "@/lib/utils/parent-report-ui";
import { getCurrentParentReports } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type ParentReportListItem = ReturnType<typeof buildParentReportListItem>;

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "Published date pending";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function ReportCard({ report }: { report: ParentReportListItem }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {report.childName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {formatMonth(report.reportingMonth)} | {report.tutorName}
            </p>
          </div>
          <StatusBadge
            label={report.progress.label}
            tone={report.progress.tone}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Class/Year
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {report.classYearGroup}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Plan
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {report.planName}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Published
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(report.publishedAt)}
            </p>
          </div>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href={report.primaryHref}>
            {report.actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function ParentReportsPage() {
  const reports = await getCurrentParentReports();
  const reportItems = reports.map(buildParentReportListItem);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Progress Reports"
        description="Track your child's learning progress through structured tutor feedback."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent">
              <FileText className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      {reportItems.length === 0 ? (
        <EmptyState
          title="No progress reports yet"
          description="No progress reports yet. Your child's published reports will appear here after lessons begin."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reportItems.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  );
}
