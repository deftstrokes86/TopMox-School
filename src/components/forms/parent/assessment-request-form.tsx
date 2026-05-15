"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import { ParentOnboardingProgress } from "@/components/forms/parent/parent-onboarding-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_SUBJECT_OPTIONS } from "@/lib/constants/subjects";
import {
  createAssessmentRequestSchema,
  type CreateAssessmentRequestInput
} from "@/lib/validations/assessment.schema";
import {
  createAssessmentRequestAction,
  type AssessmentActionResult
} from "@/server/actions/assessment.actions";

export type AssessmentChildOption = {
  id: string;
  fullName: string;
  age: number;
  classYearGroup: string;
  curriculum: string;
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

type AssessmentRequestFormProps = {
  childrenOptions: AssessmentChildOption[];
};

function getDefaultValues(
  childrenOptions: AssessmentChildOption[]
): CreateAssessmentRequestInput {
  return {
    studentId: childrenOptions[0]?.id ?? "",
    subjects: [],
    subjectIds: [],
    academicConcern: "",
    preferredAssessmentDate: undefined as unknown as Date,
    preferredAssessmentTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    notes: ""
  };
}

export function AssessmentRequestForm({
  childrenOptions
}: AssessmentRequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssessmentActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<CreateAssessmentRequestInput>({
    resolver: zodResolver(createAssessmentRequestSchema),
    defaultValues: getDefaultValues(childrenOptions)
  });

  const selectedChildId = watch("studentId");
  const selectedChild = useMemo(
    () => childrenOptions.find((child) => child.id === selectedChildId),
    [childrenOptions, selectedChildId]
  );

  const onSubmit = (values: CreateAssessmentRequestInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await createAssessmentRequestAction({
        ...values,
        subjectIds: [],
        subjects: values.subjects ?? []
      });

      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof CreateAssessmentRequestInput, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (!message) {
            return;
          }

          setError(field, { message });
        });
      }
    });
  };

  if (result?.success) {
    return (
      <div className="space-y-6">
        <ParentOnboardingProgress
          activeStep={3}
          profileSaved
          hasChildProfiles
        />

        <div className="rounded-2xl border border-success/25 bg-success/10 p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div className="space-y-2">
              <p className="text-xl font-semibold text-deep-navy">
                Your assessment request has been received.
              </p>
              <p className="max-w-2xl text-sm text-text-secondary">
                TopMox will review your child&apos;s details and confirm the next
                step. You can track the request from your parent assessment
                page.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/parent/assessments">View Assessment Status</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/parent">Back to Parent Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <ParentOnboardingProgress
        activeStep={3}
        profileSaved
        hasChildProfiles
      />

      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Start with clarity, not guesswork
        </p>
        <p className="mt-2">
          Children struggle for different reasons. This request helps TopMox
          understand your child&apos;s needs before recommending a tutoring path.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="assessment-child">Select child</Label>
          <select
            id="assessment-child"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("studentId")}
          >
            {childrenOptions.map((child) => (
              <option key={child.id} value={child.id}>
                {child.fullName} - {child.classYearGroup}
              </option>
            ))}
          </select>
          {errors.studentId ? (
            <p className="text-xs text-danger">{errors.studentId.message}</p>
          ) : null}
        </div>

        {selectedChild ? (
          <div className="rounded-xl border border-border/80 bg-soft-cream/45 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Learning profile snapshot
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {selectedChild.fullName}, age {selectedChild.age},{" "}
              {selectedChild.classYearGroup}. Curriculum:{" "}
              {selectedChild.curriculum}.
            </p>
            {selectedChild.subjects.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedChild.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="rounded-full bg-soft-blue/55 px-3 py-1 text-xs font-medium text-royal-blue"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 md:col-span-2">
          <Label>Subjects needing assessment/support</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUPPORT_SUBJECT_OPTIONS.map((subject) => (
              <label
                key={subject.slug}
                className="flex items-start gap-3 rounded-lg border border-border/80 bg-white px-3 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  value={subject.slug}
                  className="mt-0.5 h-4 w-4 rounded border-border text-royal-blue focus:ring-royal-blue"
                  {...register("subjects")}
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
          {errors.subjects ? (
            <p className="text-xs text-danger">{errors.subjects.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="academic-concern">Academic concern</Label>
          <Textarea
            id="academic-concern"
            placeholder="Tell us what you have noticed. Example: My child struggles with word problems and loses confidence during tests."
            {...register("academicConcern")}
          />
          {errors.academicConcern ? (
            <p className="text-xs text-danger">
              {errors.academicConcern.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred-assessment-date">
            Preferred assessment date
          </Label>
          <Input
            id="preferred-assessment-date"
            type="date"
            {...register("preferredAssessmentDate", { valueAsDate: true })}
          />
          {errors.preferredAssessmentDate ? (
            <p className="text-xs text-danger">
              {errors.preferredAssessmentDate.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred-assessment-time">
            Preferred assessment time
          </Label>
          <Input
            id="preferred-assessment-time"
            placeholder="Example: 5:00 PM WAT"
            {...register("preferredAssessmentTime")}
          />
          {errors.preferredAssessmentTime ? (
            <p className="text-xs text-danger">
              {errors.preferredAssessmentTime.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="assessment-timezone">Timezone</Label>
          <Input
            id="assessment-timezone"
            placeholder="Example: Africa/Lagos, Europe/London, America/Toronto"
            {...register("timezone")}
          />
          {errors.timezone ? (
            <p className="text-xs text-danger">{errors.timezone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="assessment-notes">Additional notes optional</Label>
          <Textarea
            id="assessment-notes"
            placeholder="Share anything else TopMox should know before reviewing the request."
            {...register("notes")}
          />
          {errors.notes ? (
            <p className="text-xs text-danger">{errors.notes.message}</p>
          ) : null}
        </div>
      </div>

      {result && !result.success ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {result.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting request...
            </>
          ) : (
            "Submit Assessment Request"
          )}
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/parent/assessments">View My Assessments</Link>
        </Button>
      </div>
    </form>
  );
}
