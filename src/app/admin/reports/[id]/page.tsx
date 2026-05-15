import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, FileText } from "lucide-react";

import { ReportReviewActions } from "@/components/forms/admin/report-review-actions";
import { TutorProgressReportDetail } from "@/components/reports/tutor-progress-report-detail";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAdminReportActions,
  getAdminReportProgressMeta,
  getAdminReportStatusMeta
} from "@/lib/utils/admin-report-ui";
import { getAdminReportById } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type AdminReportDetailPageProps = {
  params: {
    id: string;
  };
};

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailTile({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default async function AdminReportDetailPage({
  params
}: AdminReportDetailPageProps) {
  const report = await getAdminReportById(params.id);

  if (!report) {
    notFound();
  }

  const status = getAdminReportStatusMeta(report.status);
  const progress = getAdminReportProgressMeta(report.overallProgressStatus);
  const actions = getAdminReportActions({
    status: report.status,
    role: "ADMIN"
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Review Progress Report"
        description="Check tutor-submitted progress details, parent-facing clarity, and next-step guidance before publishing."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/reports">
              <FileText className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              {report.student.fullName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {formatMonth(report.reportingMonth)} progress report
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={status.label} tone={status.tone} />
            <StatusBadge label={progress.label} tone={progress.tone} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DetailTile
            label="Student"
            value={`${report.student.fullName} | ${report.student.classYearGroup}`}
          />
          <DetailTile
            label="Parent"
            value={`${report.parent.user.name} | ${report.parent.user.email}`}
          />
          <DetailTile
            label="Tutor"
            value={`${report.tutor.user.name} | ${report.tutor.user.email}`}
          />
          <DetailTile
            label="Country and Curriculum"
            value={`${report.student.countryOfStudy} | ${report.student.curriculum}`}
          />
          <DetailTile
            label="Published Date"
            value={formatDateTime(report.publishedAt)}
          />
          <DetailTile
            label="Linked Plan"
            value={report.enrollment?.tutoringPlan.name ?? "No linked plan"}
          />
        </CardContent>
      </Card>

      <Card className="border-warm-gold/25">
        <CardHeader>
          <CardTitle className="text-xl text-deep-navy">
            Review Actions
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Publish only when the report is clear, parent-safe, and ready to
            become visible in the parent dashboard.
          </p>
        </CardHeader>
        <CardContent>
          {actions.canPublish || actions.canReturnToDraft ? (
            <ReportReviewActions reportId={report.id} />
          ) : (
            <p className="rounded-xl border border-border bg-soft-cream/50 p-4 text-sm text-text-secondary">
              No admin publish actions are available for this report state.
              Draft reports need tutor submission first, while published reports
              are already visible to parents.
            </p>
          )}
        </CardContent>
      </Card>

      <TutorProgressReportDetail report={report} />

      <Card className="border-royal-blue/20 bg-soft-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-deep-navy">
            <Eye className="h-5 w-5 text-royal-blue" />
            Parent Preview
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This preview keeps the focus on what parents need: clarity,
            progress evidence, and practical next steps.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Parent-facing summary
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {report.tutorComments}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Next step for home support
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {report.parentActionPoints}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
