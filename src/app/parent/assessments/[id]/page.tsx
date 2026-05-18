import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";

import { AcceptRecommendedPlanButton } from "@/components/forms/parent/accept-recommended-plan-button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import {
  getAssessmentOutcomeForCurrentParent,
  getAssessmentRequestForCurrentParent
} from "@/server/queries/assessment.queries";
import { getEnrollmentByAssessmentForCurrentParent } from "@/server/queries/enrollment.queries";

export const dynamic = "force-dynamic";

type ParentAssessmentDetailPageProps = {
  params: {
    id: string;
  };
};

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

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | null;
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

export default async function ParentAssessmentDetailPage({
  params
}: ParentAssessmentDetailPageProps) {
  const [assessment, outcome] = await Promise.all([
    getAssessmentRequestForCurrentParent(params.id),
    getAssessmentOutcomeForCurrentParent(params.id)
  ]);

  if (!assessment) {
    notFound();
  }

  const status = getAssessmentStatusMeta(assessment.status);
  const acceptedEnrollment = await getEnrollmentByAssessmentForCurrentParent(
    params.id
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assessment Details"
        description="Review the information TopMox will use to understand your child's needs and coordinate the next step."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
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
                {assessment.student.classYearGroup} |{" "}
                {assessment.student.curriculum}
              </p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
          <p className="max-w-3xl text-sm text-text-secondary">
            {status.parentDescription}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Child Age" value={`${assessment.student.age}`} />
            <DetailItem
              label="Preferred Date"
              value={`${formatDate(assessment.preferredAssessmentDate)} at ${
                assessment.preferredAssessmentTime
              }`}
            />
            <DetailItem label="Timezone" value={assessment.timezone} />
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

          <div className="grid gap-3 md:grid-cols-2">
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
                {assessment.notes || "No additional notes were added."}
              </p>
            </div>
          </div>

          <Card className="border-warm-gold/25 bg-warm-gold/10 shadow-none">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold text-deep-navy">
                Scheduled assessment
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
                  TopMox will add the meeting link after scheduling the
                  assessment.
                </p>
              )}
            </CardContent>
          </Card>

          {outcome ? (
            <Card className="border-success/25 bg-success/10 shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl text-deep-navy">
                  Your child&apos;s learning recommendation is ready.
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  Based on the assessment details, TopMox has prepared a
                  structured learning direction to help your child receive the
                  right support.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-success/25 bg-white p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Clarity for the next step
                  </p>
                  <p className="mt-3 text-sm text-text-secondary">
                    You no longer have to guess where to begin. TopMox has
                    mapped a focused direction from the assessment details.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                      Academic level summary
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {outcome.academicLevelSummary}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                      Weekly lesson recommendation
                    </p>
                    <p className="mt-2 text-sm font-medium text-deep-navy">
                      {outcome.recommendedWeeklyLessonCount} lesson
                      {outcome.recommendedWeeklyLessonCount === 1 ? "" : "s"}{" "}
                      per week
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                      Strengths
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {outcome.strengths}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                      Areas needing improvement
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {outcome.weakAreas}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                    Recommended subjects
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {outcome.recommendedSubjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-soft-blue/60 px-3 py-1 text-xs font-medium text-royal-blue"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                    Parent summary
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {outcome.parentFacingSummary}
                  </p>
                </div>

                {outcome.recommendedPlan ? (
                  <div className="rounded-xl border border-royal-blue/25 bg-soft-blue/25 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
                      Recommended plan
                    </p>
                    <p className="mt-2 text-xl font-semibold text-deep-navy">
                      {outcome.recommendedPlan.name}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {outcome.recommendedPlan.description}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Best for: {outcome.recommendedPlan.bestFor}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-deep-navy">
                      {outcome.recommendedPlan.currency}{" "}
                      {outcome.recommendedPlan.monthlyPrice.toString()} monthly
                      | {outcome.recommendedPlan.sessionsPerWeek} sessions per
                      week
                    </p>
                    {outcome.recommendedPlan.features.length > 0 ? (
                      <ul className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                        {outcome.recommendedPlan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-xl border border-warm-gold/30 bg-warm-gold/10 p-5">
                  <p className="font-semibold text-deep-navy">
                    {acceptedEnrollment
                      ? "This recommendation has been accepted."
                      : "Accept the recommended plan when you are ready."}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {acceptedEnrollment
                      ? "Your tutoring plan has been created. Choose online checkout or manual transfer details as the next payment step."
                      : "Plan acceptance creates a pending tutoring plan. Payment is completed separately and only activates after verification."}
                  </p>
                  <div className="mt-4">
                    {acceptedEnrollment ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button asChild className="w-full sm:w-auto">
                          <Link href="/parent/enrollments">
                            View Tutoring Plans
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <Link
                            href={`/parent/payments/new?enrollmentId=${acceptedEnrollment.id}`}
                          >
                            Choose Payment Method
                          </Link>
                        </Button>
                      </div>
                    ) : outcome.recommendedPlanId ? (
                      <AcceptRecommendedPlanButton
                        assessmentRequestId={assessment.id}
                        recommendedPlanId={outcome.recommendedPlanId}
                      />
                    ) : (
                      <p className="text-sm text-text-secondary">
                        TopMox will add the recommended plan before acceptance is
                        available.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-royal-blue/20 bg-soft-blue/20 shadow-none">
              <CardContent className="space-y-2 p-5">
                <p className="font-semibold text-deep-navy">
                  Recommended plan
                </p>
                <p className="text-sm text-text-secondary">
                  TopMox will show the learning recommendation here after the
                  assessment outcome has been recorded.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
