"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProgressReportSchema,
  type CreateProgressReportInput,
  type UpdateProgressReportInput
} from "@/lib/validations/report.schema";
import {
  createProgressReportAction,
  updateProgressReportAction,
  type ReportActionResult
} from "@/server/actions/report.actions";

export type TutorReportStudentOption = {
  studentId: string;
  studentName: string;
  classYearGroup?: string | null;
  enrollmentId?: string | null;
  planName?: string | null;
};

type ProgressReportFormMode = "create" | "edit";

type ProgressReportFormValues = Omit<
  CreateProgressReportInput,
  "reportingMonth"
> & {
  reportingMonth: string;
};

type ProgressReportFormProps = {
  mode: ProgressReportFormMode;
  studentOptions: TutorReportStudentOption[];
  reportId?: string;
  initialValues?: Partial<UpdateProgressReportInput>;
};

const progressReportFormSchema = createProgressReportSchema.extend({
  reportingMonth: z.string().min(1, "Reporting month is required")
});

const progressStatusOptions = [
  {
    value: "NEEDS_ATTENTION",
    label: "Needs attention"
  },
  {
    value: "IMPROVING",
    label: "Improving"
  },
  {
    value: "ON_TRACK",
    label: "On track"
  },
  {
    value: "EXCELLENT",
    label: "Excellent"
  }
] as const;

const reportFormFieldNames = new Set<keyof ProgressReportFormValues>([
  "studentId",
  "enrollmentId",
  "reportingMonth",
  "subjectsCovered",
  "attendanceSummary",
  "strengths",
  "areasNeedingImprovement",
  "homeworkCompletion",
  "tutorComments",
  "recommendedNextSteps",
  "parentActionPoints",
  "overallProgressStatus"
]);

function toMonthInputValue(value?: Date | string): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 7);
}

function toReportingMonthDate(value: string): Date {
  return new Date(`${value}-01T00:00:00.000Z`);
}

function getDefaultValues({
  initialValues,
  studentOptions
}: {
  initialValues?: Partial<UpdateProgressReportInput>;
  studentOptions: TutorReportStudentOption[];
}): ProgressReportFormValues {
  const firstOption = studentOptions[0];

  return {
    studentId: initialValues?.studentId ?? firstOption?.studentId ?? "",
    enrollmentId:
      initialValues?.enrollmentId ??
      firstOption?.enrollmentId ??
      "",
    reportingMonth: toMonthInputValue(initialValues?.reportingMonth),
    subjectsCovered: initialValues?.subjectsCovered ?? "",
    attendanceSummary: initialValues?.attendanceSummary ?? "",
    strengths: initialValues?.strengths ?? "",
    areasNeedingImprovement: initialValues?.areasNeedingImprovement ?? "",
    homeworkCompletion: initialValues?.homeworkCompletion ?? "",
    tutorComments: initialValues?.tutorComments ?? "",
    recommendedNextSteps: initialValues?.recommendedNextSteps ?? "",
    parentActionPoints: initialValues?.parentActionPoints ?? "",
    overallProgressStatus: initialValues?.overallProgressStatus ?? "IMPROVING"
  };
}

function toActionInput(
  values: ProgressReportFormValues
): CreateProgressReportInput {
  return {
    ...values,
    enrollmentId: values.enrollmentId?.trim() || undefined,
    reportingMonth: toReportingMonthDate(values.reportingMonth)
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-danger">{message}</p> : null;
}

export function ProgressReportForm({
  mode,
  studentOptions,
  reportId,
  initialValues
}: ProgressReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReportActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<ProgressReportFormValues>({
    resolver: zodResolver(progressReportFormSchema),
    defaultValues: getDefaultValues({ initialValues, studentOptions })
  });

  const selectedStudentId = watch("studentId");
  const selectedStudent = useMemo(
    () =>
      studentOptions.find((option) => option.studentId === selectedStudentId),
    [studentOptions, selectedStudentId]
  );
  const enrollmentOptions = useMemo(
    () =>
      studentOptions.filter(
        (option) =>
          option.studentId === selectedStudentId && Boolean(option.enrollmentId)
      ),
    [studentOptions, selectedStudentId]
  );

  const onSubmit = (values: ProgressReportFormValues) => {
    setResult(null);

    startTransition(async () => {
      const actionInput = toActionInput(values);
      const actionResult =
        mode === "edit"
          ? await updateProgressReportAction({
              ...actionInput,
              reportId: reportId ?? ""
            })
          : await createProgressReportAction(actionInput);

      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof ProgressReportFormValues, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (message && reportFormFieldNames.has(field)) {
            setError(field, { message });
          }
        });

        return;
      }

      if (actionResult.success && actionResult.data?.reportId) {
        router.push(`/tutor/reports/${actionResult.data.reportId}`);
        router.refresh();
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Write for clarity and follow-through
        </p>
        <p className="mt-2">
          Structure the report around what was covered, what changed, what still
          needs attention, and what the parent can do next. Admin will review
          the report before it becomes visible to parents.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
              Student and month
            </p>
            <h2 className="mt-1 text-xl font-semibold text-deep-navy">
              Report context
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-student">Student</Label>
              <select
                id="report-student"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("studentId")}
              >
                {studentOptions.length === 0 ? (
                  <option value="">No assigned students available</option>
                ) : null}
                {studentOptions.map((option) => (
                  <option key={option.studentId} value={option.studentId}>
                    {option.studentName}
                    {option.classYearGroup ? ` - ${option.classYearGroup}` : ""}
                  </option>
                ))}
              </select>
              <FieldError message={errors.studentId?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-enrollment">Enrollment optional</Label>
              <select
                id="report-enrollment"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("enrollmentId")}
              >
                <option value="">No linked enrollment</option>
                {enrollmentOptions.map((option) => (
                  <option
                    key={option.enrollmentId ?? option.studentId}
                    value={option.enrollmentId ?? ""}
                  >
                    {option.planName ?? "Active tutoring plan"}
                  </option>
                ))}
              </select>
              <FieldError message={errors.enrollmentId?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporting-month">Reporting month</Label>
              <Input
                id="reporting-month"
                type="month"
                {...register("reportingMonth")}
              />
              <FieldError message={errors.reportingMonth?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overall-progress-status">
                Overall progress status
              </Label>
              <select
                id="overall-progress-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("overallProgressStatus")}
              >
                {progressStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.overallProgressStatus?.message} />
            </div>
          </div>

          {selectedStudent ? (
            <p className="mt-4 rounded-xl border border-soft-blue bg-soft-blue/30 p-3 text-sm text-text-secondary">
              You are preparing a structured progress update for{" "}
              <span className="font-semibold text-deep-navy">
                {selectedStudent.studentName}
              </span>
              {selectedStudent.planName
                ? ` under the ${selectedStudent.planName}.`
                : "."}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
              Learning evidence
            </p>
            <h2 className="mt-1 text-xl font-semibold text-deep-navy">
              What happened this month
            </h2>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="subjects-covered">Subjects covered</Label>
              <Textarea
                id="subjects-covered"
                placeholder="Example: Fractions, reading comprehension, grammar revision."
                {...register("subjectsCovered")}
              />
              <FieldError message={errors.subjectsCovered?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-summary">Attendance summary</Label>
              <Textarea
                id="attendance-summary"
                placeholder="Summarize attendance, punctuality, and lesson consistency."
                {...register("attendanceSummary")}
              />
              <FieldError message={errors.attendanceSummary?.message} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  placeholder="What improved or showed promise?"
                  {...register("strengths")}
                />
                <FieldError message={errors.strengths?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areas-needing-improvement">
                  Areas needing improvement
                </Label>
                <Textarea
                  id="areas-needing-improvement"
                  placeholder="What still needs focused support?"
                  {...register("areasNeedingImprovement")}
                />
                <FieldError message={errors.areasNeedingImprovement?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework-completion">Homework completion</Label>
              <Textarea
                id="homework-completion"
                placeholder="Describe homework effort, completion, and follow-through."
                {...register("homeworkCompletion")}
              />
              <FieldError message={errors.homeworkCompletion?.message} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
              Tutor recommendation
            </p>
            <h2 className="mt-1 text-xl font-semibold text-deep-navy">
              What should happen next
            </h2>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="tutor-comments">Tutor comments</Label>
              <Textarea
                id="tutor-comments"
                placeholder="Give a professional summary of the student's learning behavior and momentum."
                {...register("tutorComments")}
              />
              <FieldError message={errors.tutorComments?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommended-next-steps">
                Recommended next steps
              </Label>
              <Textarea
                id="recommended-next-steps"
                placeholder="What should TopMox focus on in upcoming lessons?"
                {...register("recommendedNextSteps")}
              />
              <FieldError message={errors.recommendedNextSteps?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-action-points">
                Parent action points
              </Label>
              <Textarea
                id="parent-action-points"
                placeholder="Simple, practical actions the parent can support at home."
                {...register("parentActionPoints")}
              />
              <FieldError message={errors.parentActionPoints?.message} />
            </div>
          </div>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving report...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "edit" ? "Save Draft Report" : "Draft Progress Report"}
            </>
          )}
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/tutor/reports">Back to Reports</Link>
        </Button>
      </div>
    </form>
  );
}
