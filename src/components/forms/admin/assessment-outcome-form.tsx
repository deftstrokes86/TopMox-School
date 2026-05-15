"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_SUBJECT_OPTIONS } from "@/lib/constants/subjects";
import {
  assessmentOutcomeSchema,
  type AssessmentOutcomeInput
} from "@/lib/validations/assessment.schema";
import {
  recordAssessmentOutcomeAction,
  type AssessmentActionResult
} from "@/server/actions/assessment.actions";

export type OutcomePlanOption = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  currency: string;
  sessionsPerWeek: number;
  bestFor: string;
  features: string[];
};

type AssessmentOutcomeInitialValues = Partial<AssessmentOutcomeInput>;

type AssessmentOutcomeFormProps = {
  assessmentRequestId: string;
  planOptions: OutcomePlanOption[];
  initialValues?: AssessmentOutcomeInitialValues;
};

function getDefaultValues({
  assessmentRequestId,
  initialValues
}: {
  assessmentRequestId: string;
  initialValues?: AssessmentOutcomeInitialValues;
}): AssessmentOutcomeInput {
  return {
    assessmentRequestId,
    academicLevelSummary: initialValues?.academicLevelSummary ?? "",
    strengths: initialValues?.strengths ?? "",
    weakAreas: initialValues?.weakAreas ?? "",
    recommendedSubjects: initialValues?.recommendedSubjects ?? [],
    recommendedPlanId: initialValues?.recommendedPlanId ?? "",
    recommendedWeeklyLessonCount:
      initialValues?.recommendedWeeklyLessonCount ?? 2,
    parentFacingSummary: initialValues?.parentFacingSummary ?? "",
    internalAdminNotes: initialValues?.internalAdminNotes ?? ""
  };
}

export function AssessmentOutcomeForm({
  assessmentRequestId,
  planOptions,
  initialValues
}: AssessmentOutcomeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssessmentActionResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<AssessmentOutcomeInput>({
    resolver: zodResolver(assessmentOutcomeSchema),
    defaultValues: getDefaultValues({ assessmentRequestId, initialValues })
  });

  const selectedPlanId = watch("recommendedPlanId");
  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === selectedPlanId),
    [planOptions, selectedPlanId]
  );

  const onSubmit = (values: AssessmentOutcomeInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await recordAssessmentOutcomeAction(values);
      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof AssessmentOutcomeInput, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (message) {
            setError(field, { message });
          }
        });

        return;
      }

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="hidden"
        value={assessmentRequestId}
        {...register("assessmentRequestId")}
      />

      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Record the recommendation parents will rely on
        </p>
        <p className="mt-2">
          Keep the parent-facing summary clear, practical, and reassuring. The
          internal notes stay visible only to TopMox admins.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="academic-level-summary">Academic level summary</Label>
          <Textarea
            id="academic-level-summary"
            placeholder="Summarize the child's current academic level and readiness."
            {...register("academicLevelSummary")}
          />
          {errors.academicLevelSummary ? (
            <p className="text-xs text-danger">
              {errors.academicLevelSummary.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              placeholder="What is the child already doing well?"
              {...register("strengths")}
            />
            {errors.strengths ? (
              <p className="text-xs text-danger">{errors.strengths.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weak-areas">Weak areas</Label>
            <Textarea
              id="weak-areas"
              placeholder="What areas need structured support?"
              {...register("weakAreas")}
            />
            {errors.weakAreas ? (
              <p className="text-xs text-danger">{errors.weakAreas.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recommended subjects</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUPPORT_SUBJECT_OPTIONS.map((subject) => (
              <label
                key={subject.slug}
                className="flex items-start gap-3 rounded-lg border border-border/80 bg-white px-3 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  value={subject.name}
                  className="mt-0.5 h-4 w-4 rounded border-border text-royal-blue focus:ring-royal-blue"
                  {...register("recommendedSubjects")}
                />
                <span>
                  <span className="font-medium text-deep-navy">
                    {subject.name}
                  </span>
                  <span className="mt-1 block text-xs text-text-secondary">
                    {subject.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.recommendedSubjects ? (
            <p className="text-xs text-danger">
              {errors.recommendedSubjects.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.5fr]">
          <div className="space-y-2">
            <Label htmlFor="recommended-plan">Recommended tutoring plan</Label>
            <select
              id="recommended-plan"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("recommendedPlanId")}
            >
              <option value="">Save outcome without publishing plan</option>
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.sessionsPerWeek} sessions/week
                </option>
              ))}
            </select>
            {errors.recommendedPlanId ? (
              <p className="text-xs text-danger">
                {errors.recommendedPlanId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly-count">Weekly lesson count</Label>
            <Input
              id="weekly-count"
              type="number"
              min={1}
              {...register("recommendedWeeklyLessonCount", {
                valueAsNumber: true
              })}
            />
            {errors.recommendedWeeklyLessonCount ? (
              <p className="text-xs text-danger">
                {errors.recommendedWeeklyLessonCount.message}
              </p>
            ) : null}
          </div>
        </div>

        {selectedPlan ? (
          <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4">
            <p className="font-semibold text-deep-navy">{selectedPlan.name}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {selectedPlan.bestFor}
            </p>
            <p className="mt-2 text-sm font-medium text-deep-navy">
              {selectedPlan.currency} {selectedPlan.monthlyPrice} monthly |{" "}
              {selectedPlan.sessionsPerWeek} sessions per week
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
            You can save assessment notes without a plan, but parents only see a
            learning recommendation after an active tutoring plan is selected.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="parent-facing-summary">Parent-facing summary</Label>
          <Textarea
            id="parent-facing-summary"
            placeholder="Explain the recommended learning direction in a clear, reassuring way for the parent."
            {...register("parentFacingSummary")}
          />
          {errors.parentFacingSummary ? (
            <p className="text-xs text-danger">
              {errors.parentFacingSummary.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="internal-admin-notes">Internal admin notes</Label>
          <Textarea
            id="internal-admin-notes"
            placeholder="Internal context for TopMox only. Parents will not see this."
            {...register("internalAdminNotes")}
          />
          {errors.internalAdminNotes ? (
            <p className="text-xs text-danger">
              {errors.internalAdminNotes.message}
            </p>
          ) : null}
        </div>
      </div>

      {result ? (
        <div
          className={
            result.success
              ? "rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
              : "rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          }
        >
          {result.success ? (
            <p className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {result.message}
            </p>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving recommendation...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Outcome Recommendation
          </>
        )}
      </Button>
    </form>
  );
}

