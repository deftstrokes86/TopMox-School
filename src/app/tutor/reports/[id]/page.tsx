import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3 } from "lucide-react";

import { SubmitReportForReviewButton } from "@/components/forms/tutor/submit-report-for-review-button";
import { TutorProgressReportDetail } from "@/components/reports/tutor-progress-report-detail";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTutorReportActions,
  getTutorReportStatusMeta
} from "@/lib/utils/tutor-report-ui";
import { getCurrentTutorReportById } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type TutorReportDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function TutorReportDetailPage({
  params
}: TutorReportDetailPageProps) {
  const report = await getCurrentTutorReportById(params.id);

  if (!report) {
    notFound();
  }

  const actions = getTutorReportActions({ status: report.status });
  const status = getTutorReportStatusMeta(report.status);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Progress Report"
        description="Review the report content before sending it to TopMox admin for review."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/tutor/reports">Back to Reports</Link>
          </Button>
        }
      />

      <Card className="border-warm-gold/25 bg-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-deep-navy">
              Current report stage
            </p>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              {report.status === "DRAFT"
                ? "This draft is still editable. Submit it for admin review when it is ready."
                : report.status === "REVIEW"
                  ? "This report is with TopMox admin for review. It is read-only for tutors while in review."
                  : "This report has been published and is read-only for tutors."}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </CardContent>
      </Card>

      {actions.canSubmitForReview ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-royal-blue/20 bg-soft-blue/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-deep-navy">
              Ready for TopMox review?
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Once submitted, admin will review the report before it becomes
              visible to parents.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/tutor/reports/${report.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Draft
              </Link>
            </Button>
            <SubmitReportForReviewButton reportId={report.id} />
          </div>
        </div>
      ) : null}

      <TutorProgressReportDetail report={report} />
    </section>
  );
}
