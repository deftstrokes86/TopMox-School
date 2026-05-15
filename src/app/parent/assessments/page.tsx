import Link from "next/link";
import { ArrowRight, CalendarClock, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import { getCurrentParentAssessmentRequests } from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

type AssessmentListItem = Awaited<
  ReturnType<typeof getCurrentParentAssessmentRequests>
>[number];

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(value);
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function AssessmentCard({ assessment }: { assessment: AssessmentListItem }) {
  const status = getAssessmentStatusMeta(assessment.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {assessment.student.fullName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {assessment.student.classYearGroup} |{" "}
              {assessment.student.curriculum}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
            Subjects
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {assessment.subjects.map((subject) => (
              <span
                key={subject.id}
                className="rounded-full bg-soft-blue/50 px-3 py-1 text-xs font-medium text-royal-blue"
              >
                {subject.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Preferred Time
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(assessment.preferredAssessmentDate)} at{" "}
              {assessment.preferredAssessmentTime}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {assessment.timezone}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Scheduled Assessment
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDateTime(assessment.scheduledAt)}
            </p>
            {assessment.meetingLink ? (
              <a
                href={assessment.meetingLink}
                className="mt-1 inline-block text-xs font-medium text-royal-blue hover:text-deep-navy"
                target="_blank"
                rel="noreferrer"
              >
                Open meeting link
              </a>
            ) : (
              <p className="mt-1 text-xs text-text-muted">
                TopMox will share details once scheduled.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            Academic Concern
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-text-secondary">
            {assessment.academicConcern}
          </p>
        </div>

        <Button
          asChild
          variant={assessment.status === "PLAN_RECOMMENDED" ? "default" : "outline"}
          className="w-full sm:w-auto"
        >
          <Link href={`/parent/assessments/${assessment.id}`}>
            {assessment.status === "PLAN_RECOMMENDED"
              ? "View Learning Recommendation"
              : "View Assessment Details"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function ParentAssessmentsPage() {
  const assessments = await getCurrentParentAssessmentRequests();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Track your child assessment requests, review scheduling details, and follow the next step toward a clearer learning path."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/book-assessment">
              <Plus className="mr-2 h-4 w-4" />
              Book Another Assessment
            </Link>
          </Button>
        }
      />

      {assessments.length === 0 ? (
        <EmptyState
          title="No assessment request yet"
          description="No assessment request yet. Book a child assessment so TopMox can recommend the right learning path."
          action={
            <Button asChild>
              <Link href="/book-assessment">
                <CalendarClock className="mr-2 h-4 w-4" />
                Book a Child Assessment
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </section>
  );
}
