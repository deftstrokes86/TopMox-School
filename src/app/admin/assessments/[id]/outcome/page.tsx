import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import { AssessmentOutcomeForm } from "@/components/forms/admin/assessment-outcome-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import {
  getActiveTutoringPlansForAdmin,
  getAdminAssessmentRequestById,
  getAssessmentOutcomeForAdmin
} from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

type AdminAssessmentOutcomePageProps = {
  params: {
    id: string;
  };
};

function formatPrice(currency: string, price: { toString: () => string }) {
  return `${currency} ${price.toString()}`;
}

export default async function AdminAssessmentOutcomePage({
  params
}: AdminAssessmentOutcomePageProps) {
  const [assessment, activePlans, outcome] = await Promise.all([
    getAdminAssessmentRequestById(params.id),
    getActiveTutoringPlansForAdmin(),
    getAssessmentOutcomeForAdmin(params.id)
  ]);

  if (!assessment) {
    notFound();
  }

  const status = getAssessmentStatusMeta(assessment.status);
  const canRecordOutcome =
    assessment.status === "COMPLETED" ||
    assessment.status === "PLAN_RECOMMENDED";
  const planOptions = activePlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice.toString(),
    currency: plan.currency,
    sessionsPerWeek: plan.sessionsPerWeek,
    bestFor: plan.bestFor,
    features: plan.features
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Record Assessment Outcome"
        description="Capture the academic findings and recommend the right tutoring plan for the parent to review."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/assessments/${assessment.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessment
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-deep-navy">
                {assessment.student.fullName}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Parent: {assessment.parent.user.name} |{" "}
                {assessment.student.classYearGroup} |{" "}
                {assessment.student.curriculum}
              </p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Subjects
            </p>
            <p className="mt-2 text-sm font-medium text-text-primary">
              {assessment.subjects.map((subject) => subject.name).join(", ")}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Academic Concern
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
              {assessment.academicConcern}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Active Plans
            </p>
            <p className="mt-2 text-sm font-medium text-text-primary">
              {activePlans.length} available
            </p>
          </div>
        </CardContent>
      </Card>

      {!canRecordOutcome ? (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="space-y-3 p-6">
            <p className="flex items-center gap-2 font-semibold text-deep-navy">
              <ClipboardCheck className="h-5 w-5 text-warning" />
              Outcome recording is not available yet
            </p>
            <p className="text-sm text-text-secondary">
              Assessment outcomes can only be recorded after the assessment has
              been marked completed.
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/admin/assessments/${assessment.id}`}>
                Return to Assessment Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.7fr]">
          <Card className="border-royal-blue/20 shadow-soft">
            <CardContent className="p-6 md:p-8">
              <AssessmentOutcomeForm
                assessmentRequestId={assessment.id}
                planOptions={planOptions}
                initialValues={
                  outcome
                    ? {
                        academicLevelSummary: outcome.academicLevelSummary,
                        strengths: outcome.strengths,
                        weakAreas: outcome.weakAreas,
                        recommendedSubjects: outcome.recommendedSubjects,
                        recommendedPlanId: outcome.recommendedPlanId ?? "",
                        recommendedWeeklyLessonCount:
                          outcome.recommendedWeeklyLessonCount,
                        parentFacingSummary: outcome.parentFacingSummary,
                        internalAdminNotes: outcome.internalAdminNotes
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="border-warm-gold/25 bg-warm-gold/10">
              <CardContent className="space-y-2 p-5">
                <p className="font-semibold text-deep-navy">
                  Recommendation publishing
                </p>
                <p className="text-sm text-text-secondary">
                  Selecting an active plan publishes the recommendation to the
                  parent and moves the assessment to Plan Recommended.
                </p>
              </CardContent>
            </Card>

            {activePlans.map((plan) => (
              <Card key={plan.id} className="border-border/80">
                <CardContent className="space-y-2 p-5">
                  <p className="font-semibold text-deep-navy">{plan.name}</p>
                  <p className="text-sm text-text-secondary">{plan.bestFor}</p>
                  <p className="text-sm font-medium text-deep-navy">
                    {formatPrice(plan.currency, plan.monthlyPrice)} |{" "}
                    {plan.sessionsPerWeek} sessions/week
                  </p>
                </CardContent>
              </Card>
            ))}
          </aside>
        </div>
      )}
    </section>
  );
}

