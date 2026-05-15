import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import {
  ProgressReportForm,
  type TutorReportStudentOption
} from "@/components/forms/tutor/progress-report-form";
import { TutorProgressReportDetail } from "@/components/reports/tutor-progress-report-detail";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTutorReportStatusMeta } from "@/lib/utils/tutor-report-ui";
import { getCurrentTutorReportById } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

type EditTutorReportPageProps = {
  params: {
    id: string;
  };
};

function buildStudentOptions(report: NonNullable<Awaited<ReturnType<typeof getCurrentTutorReportById>>>): TutorReportStudentOption[] {
  return [
    {
      studentId: report.student.id,
      studentName: report.student.fullName,
      classYearGroup: report.student.classYearGroup,
      enrollmentId: report.enrollment?.id,
      planName: report.enrollment?.tutoringPlan.name
    }
  ];
}

export default async function EditTutorReportPage({
  params
}: EditTutorReportPageProps) {
  const report = await getCurrentTutorReportById(params.id);

  if (!report) {
    notFound();
  }

  const status = getTutorReportStatusMeta(report.status);

  if (report.status !== "DRAFT") {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Report Is Read-Only"
          description="Reports in review or published status cannot be edited by tutors in this phase."
          actions={
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/tutor/reports/${report.id}`}>Back to Report</Link>
            </Button>
          }
        />

        <Card className="border-warning/25 bg-warning/10">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-semibold text-deep-navy">
                <LockKeyhole className="h-4 w-4 text-warning-foreground" />
                Editing is locked
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                This keeps reviewed and published reports stable. If a change is
                needed, TopMox admin can return a report to draft in a later
                review workflow.
              </p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </CardContent>
        </Card>

        <TutorProgressReportDetail report={report} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Edit Draft Report"
        description="Refine the draft before submitting it for TopMox admin review."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/tutor/reports/${report.id}`}>Back to Report</Link>
          </Button>
        }
      />

      <ProgressReportForm
        mode="edit"
        reportId={report.id}
        studentOptions={buildStudentOptions(report)}
        initialValues={{
          reportId: report.id,
          studentId: report.student.id,
          enrollmentId: report.enrollment?.id ?? undefined,
          reportingMonth: report.reportingMonth,
          subjectsCovered: report.subjectsCovered,
          attendanceSummary: report.attendanceSummary,
          strengths: report.strengths,
          areasNeedingImprovement: report.areasNeedingImprovement,
          homeworkCompletion: report.homeworkCompletion,
          tutorComments: report.tutorComments,
          recommendedNextSteps: report.recommendedNextSteps,
          parentActionPoints: report.parentActionPoints,
          overallProgressStatus: report.overallProgressStatus
        }}
      />
    </section>
  );
}
