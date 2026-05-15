import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AssessmentInternalNotesForm } from "@/components/forms/admin/assessment-internal-notes-form";
import { AssessmentScheduleForm } from "@/components/forms/admin/assessment-schedule-form";
import { AssessmentStatusActions } from "@/components/forms/admin/assessment-status-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAssessmentStatusMeta,
  type AssessmentStatusValue
} from "@/lib/utils/assessment-status";
import { getAdminAssessmentRequestById } from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

type AdminAssessmentDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(value);
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function AdminAssessmentDetailPage({
  params
}: AdminAssessmentDetailPageProps) {
  const assessment = await getAdminAssessmentRequestById(params.id);

  if (!assessment) {
    notFound();
  }

  const status = getAssessmentStatusMeta(assessment.status);
  const canSchedule = assessment.status === "PENDING_REVIEW";
  const statusValue = assessment.status as AssessmentStatusValue;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assessment Request Details"
        description="Review the parent request, schedule the assessment, and update the assessment status through the approved workflow."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-deep-navy">
                {assessment.student.fullName}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Parent: {assessment.parent.user.name} |{" "}
                {assessment.parent.country}
              </p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Parent email" value={assessment.parent.user.email} />
            <DetailItem
              label="WhatsApp"
              value={assessment.parent.whatsappNumber}
            />
            <DetailItem
              label="Preferred contact"
              value={assessment.parent.preferredContactMethod}
            />
            <DetailItem label="Country" value={assessment.parent.country} />
            <DetailItem label="Timezone" value={assessment.parent.timezone} />
            <DetailItem
              label="Preferred assessment"
              value={`${formatDate(assessment.preferredAssessmentDate)} at ${
                assessment.preferredAssessmentTime ?? "time not set"
              }`}
            />
          </div>

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

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                Academic Concern
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {assessment.academicConcern}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                Parent Notes
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {assessment.notes || "No additional parent notes were added."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Child Learning Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Age" value={`${assessment.student.age}`} />
              <DetailItem
                label="Class / Year group"
                value={assessment.student.classYearGroup}
              />
              <DetailItem
                label="Country of study"
                value={assessment.student.countryOfStudy}
              />
              <DetailItem label="Curriculum" value={assessment.student.curriculum} />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Main academic challenge
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {assessment.student.mainAcademicChallenge}
                </p>
              </div>
              <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Academic goal
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {assessment.student.academicGoal || "No goal provided yet."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-royal-blue/20">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Scheduling Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {canSchedule ? (
              <AssessmentScheduleForm
                assessmentRequestId={assessment.id}
                existingScheduledAt={assessment.scheduledAt?.toISOString() ?? null}
                existingMeetingLink={assessment.meetingLink}
                existingInternalNotes={assessment.internalNotes}
              />
            ) : (
              <div className="space-y-3 rounded-xl border border-border/80 bg-soft-cream/45 p-4">
                <p className="font-semibold text-deep-navy">
                  Current schedule
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDateTime(assessment.scheduledAt)}
                </p>
                {assessment.meetingLink ? (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a
                      href={assessment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Meeting Link
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-text-secondary">
                    No meeting link has been added.
                  </p>
                )}
                <p className="text-xs text-text-muted">
                  Rescheduling is intentionally deferred. Use internal notes for
                  follow-up context.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Status Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentStatusActions
              assessmentRequestId={assessment.id}
              status={statusValue}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentInternalNotesForm
              assessmentRequestId={assessment.id}
              initialNotes={assessment.internalNotes}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl text-deep-navy">
            Communication Log Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.communicationLogs.length > 0 ? (
            assessment.communicationLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-border/80 bg-soft-cream/40 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-deep-navy">
                    {log.type.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{log.message}</p>
                {log.createdBy ? (
                  <p className="mt-2 text-xs text-text-muted">
                    Added by {log.createdBy.name || log.createdBy.email}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
              Communication logs will appear here after admin notes are added in
              a later phase.
            </p>
          )}
        </CardContent>
      </Card>

      {assessment.status === "PLAN_RECOMMENDED" && assessment.outcome ? (
        <Card className="border-success/25 bg-success/10">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Recommendation Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-text-secondary">
              {assessment.outcome.parentFacingSummary}
            </p>
            {assessment.outcome.recommendedPlan ? (
              <p className="text-sm font-medium text-deep-navy">
                Recommended plan: {assessment.outcome.recommendedPlan.name} (
                {assessment.outcome.recommendedPlan.sessionsPerWeek} sessions
                per week)
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

