import Link from "next/link";
import { FileText } from "lucide-react";

import {
  ProgressReportForm,
  type TutorReportStudentOption
} from "@/components/forms/tutor/progress-report-form";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReportsDueForTutor } from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

function buildStudentOptions(
  reportsDue: Awaited<ReturnType<typeof getReportsDueForTutor>>
): TutorReportStudentOption[] {
  return reportsDue.map((item) => ({
    studentId: item.student.id,
    studentName: item.student.fullName,
    classYearGroup: item.student.classYearGroup,
    enrollmentId: item.id,
    planName: item.tutoringPlan.name
  }));
}

export default async function NewTutorReportPage() {
  const reportsDue = await getReportsDueForTutor();
  const studentOptions = buildStudentOptions(reportsDue);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Draft Progress Report"
        description="Prepare a structured monthly learning update for a student assigned to you. Admin will review the report before parents can see it."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/tutor/reports">Back to Reports</Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-soft-blue/20">
        <CardContent className="p-5 text-sm text-text-secondary">
          <p className="font-semibold text-deep-navy">
            Keep the report practical and parent-ready.
          </p>
          <p className="mt-2 max-w-3xl">
            Focus on evidence from lessons, homework follow-through, academic
            momentum, and the next support step. This keeps TopMox reports
            useful without making tutors wrestle a giant unstructured text wall.
          </p>
        </CardContent>
      </Card>

      {studentOptions.length === 0 ? (
        <EmptyState
          title="No report-ready students"
          description="Progress report drafting appears when an active assigned enrollment needs a report for the current month."
          action={
            <Button asChild variant="outline">
              <Link href="/tutor/lessons">
                <FileText className="mr-2 h-4 w-4" />
                Review Assigned Lessons
              </Link>
            </Button>
          }
        />
      ) : (
        <ProgressReportForm mode="create" studentOptions={studentOptions} />
      )}
    </section>
  );
}
