import { Download, GraduationCap } from "lucide-react";

import { ReportPrintButton } from "@/components/reports/ReportPrintButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildParentReportListItem,
  getParentReportDetailActions,
  type ParentReportListSource
} from "@/lib/utils/parent-report-ui";

type ParentProgressReportViewProps = {
  report: ParentReportListSource;
};

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

function ReportSection({
  title,
  children
}: {
  title: string;
  children: string;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-white p-5">
      <h2 className="text-base font-semibold text-deep-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-text-secondary">{children}</p>
    </section>
  );
}

export function ParentProgressReportView({
  report
}: ParentProgressReportViewProps) {
  const item = buildParentReportListItem(report);
  const actions = getParentReportDetailActions();

  return (
    <article className="mx-auto max-w-5xl space-y-6 print:max-w-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
        {actions.canPrint ? <ReportPrintButton label={actions.printLabel} /> : null}
        <Button
          disabled={!actions.canDownloadPdf}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {actions.downloadPdfLabel}
        </Button>
      </div>

      <Card className="overflow-hidden border-royal-blue/20 bg-white shadow-soft print:border-border print:shadow-none">
        <div className="bg-deep-navy px-6 py-6 text-white print:bg-white print:text-black md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-gold">
                TopMox Global Tutoring
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
                Progress Report
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 print:text-black">
                A structured learning update prepared to help you see what is
                happening, where your child is growing, and what comes next.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm print:border-border print:bg-white">
              <p className="font-semibold text-warm-gold">TopMox Schools</p>
              <p className="mt-1 text-white/78 print:text-black">
                School-backed tutoring
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 p-6 md:p-8">
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border/80 bg-soft-cream/45 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Student
              </p>
              <p className="mt-2 text-xl font-semibold text-deep-navy">
                {item.childName}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.classYearGroup}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-soft-cream/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Tutor
              </p>
              <p className="mt-2 text-sm font-semibold text-deep-navy">
                {item.tutorName}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-soft-cream/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Reporting Month
              </p>
              <p className="mt-2 text-sm font-semibold text-deep-navy">
                {formatMonth(item.reportingMonth)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-warm-gold/30 bg-warm-gold/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Overall Progress Status
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-deep-navy">
                  {item.progress.label}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                  This report gives you practical visibility into your child&apos;s
                  learning path so support can stay structured, calm, and
                  consistent.
                </p>
              </div>
              <StatusBadge label={item.progress.label} tone={item.progress.tone} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-white p-4">
              <GraduationCap className="h-5 w-5 text-royal-blue" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Subjects Covered
              </p>
              <p className="mt-2 text-sm font-medium text-text-primary">
                {report.subjectsCovered}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Attendance Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {report.attendanceSummary}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Published
              </p>
              <p className="mt-2 text-sm font-medium text-text-primary">
                {formatDate(report.publishedAt)}
              </p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <ReportSection title="Strengths">{report.strengths}</ReportSection>
            <ReportSection title="Areas Needing Improvement">
              {report.areasNeedingImprovement}
            </ReportSection>
            <ReportSection title="Homework Completion">
              {report.homeworkCompletion}
            </ReportSection>
            <ReportSection title="Tutor Comments">
              {report.tutorComments}
            </ReportSection>
            <ReportSection title="Recommended Next Steps">
              {report.recommendedNextSteps}
            </ReportSection>
            <ReportSection title="Parent Action Points">
              {report.parentActionPoints}
            </ReportSection>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
