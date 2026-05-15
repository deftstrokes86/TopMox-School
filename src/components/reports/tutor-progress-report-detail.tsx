import type { ProgressReportQueryResult } from "@/server/queries/report.queries";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTutorProgressStatusMeta,
  getTutorReportStatusMeta
} from "@/lib/utils/tutor-report-ui";

type TutorProgressReportDetailProps = {
  report: ProgressReportQueryResult;
};

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function ReportField({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-soft-cream/45 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">
        {value}
      </p>
    </div>
  );
}

export function TutorProgressReportDetail({
  report
}: TutorProgressReportDetailProps) {
  const status = getTutorReportStatusMeta(report.status);
  const progress = getTutorProgressStatusMeta(report.overallProgressStatus);

  return (
    <div className="space-y-5">
      <Card className="border-royal-blue/20">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-deep-navy">
                {report.student.fullName}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                {formatMonth(report.reportingMonth)}
                {report.student.classYearGroup
                  ? ` | ${report.student.classYearGroup}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={status.label} tone={status.tone} />
              <StatusBadge label={progress.label} tone={progress.tone} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Plan
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {report.enrollment?.tutoringPlan.name ?? "No linked plan"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Sessions
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {report.enrollment
                ? `${report.enrollment.tutoringPlan.sessionsPerWeek} per week`
                : "Not linked"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Stage
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {status.label}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-deep-navy">
            Learning Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <ReportField
            label="Subjects Covered"
            value={report.subjectsCovered}
          />
          <ReportField
            label="Attendance Summary"
            value={report.attendanceSummary}
          />
          <ReportField label="Strengths" value={report.strengths} />
          <ReportField
            label="Areas Needing Improvement"
            value={report.areasNeedingImprovement}
          />
          <ReportField
            label="Homework Completion"
            value={report.homeworkCompletion}
          />
          <ReportField label="Tutor Comments" value={report.tutorComments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-deep-navy">
            Next Steps for Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <ReportField
            label="Recommended Next Steps"
            value={report.recommendedNextSteps}
          />
          <ReportField
            label="Parent Action Points"
            value={report.parentActionPoints}
          />
        </CardContent>
      </Card>
    </div>
  );
}
