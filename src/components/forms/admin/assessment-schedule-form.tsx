"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  scheduleAssessmentSchema,
  type ScheduleAssessmentInput
} from "@/lib/validations/assessment.schema";
import {
  scheduleAssessmentAction,
  type AssessmentActionResult
} from "@/server/actions/assessment.actions";

type AssessmentScheduleFormProps = {
  assessmentRequestId: string;
  existingScheduledAt?: string | null;
  existingMeetingLink?: string | null;
  existingInternalNotes?: string | null;
};

function toDateTimeLocalValue(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function AssessmentScheduleForm({
  assessmentRequestId,
  existingScheduledAt,
  existingMeetingLink,
  existingInternalNotes
}: AssessmentScheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssessmentActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ScheduleAssessmentInput>({
    resolver: zodResolver(scheduleAssessmentSchema),
    defaultValues: {
      assessmentRequestId,
      scheduledAt: undefined as unknown as Date,
      meetingLink: existingMeetingLink ?? "",
      internalNotes: existingInternalNotes ?? ""
    }
  });

  const onSubmit = (values: ScheduleAssessmentInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await scheduleAssessmentAction(values);
      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof ScheduleAssessmentInput, string | undefined]
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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="hidden"
        value={assessmentRequestId}
        {...register("assessmentRequestId")}
      />

      <div className="space-y-2">
        <Label htmlFor="scheduled-at">Scheduled date and time</Label>
        <Input
          id="scheduled-at"
          type="datetime-local"
          defaultValue={toDateTimeLocalValue(existingScheduledAt)}
          {...register("scheduledAt", { valueAsDate: true })}
        />
        {errors.scheduledAt ? (
          <p className="text-xs text-danger">{errors.scheduledAt.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-link">Meeting link optional</Label>
        <Input
          id="meeting-link"
          placeholder="https://meet.google.com/..."
          {...register("meetingLink")}
        />
        {errors.meetingLink ? (
          <p className="text-xs text-danger">{errors.meetingLink.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule-notes">Internal notes optional</Label>
        <Textarea
          id="schedule-notes"
          placeholder="Add scheduling notes for the TopMox team."
          {...register("internalNotes")}
        />
        {errors.internalNotes ? (
          <p className="text-xs text-danger">{errors.internalNotes.message}</p>
        ) : null}
      </div>

      {result ? (
        <p
          className={
            result.success
              ? "rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
              : "rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          }
        >
          {result.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving schedule...
          </>
        ) : (
          <>
            <CalendarClock className="mr-2 h-4 w-4" />
            Save Schedule
          </>
        )}
      </Button>
    </form>
  );
}

