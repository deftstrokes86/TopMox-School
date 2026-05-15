"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  completeTutorLessonAction,
  type LessonActionResult
} from "@/server/actions/lesson.actions";

type AttendanceValue = "" | "attended" | "missed";

type LessonCompletionFormProps = {
  lessonId: string;
};

export function LessonCompletionForm({ lessonId }: LessonCompletionFormProps) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceValue>("");
  const [lessonNotes, setLessonNotes] = useState("");
  const [concernFlag, setConcernFlag] = useState(false);
  const [concernNote, setConcernNote] = useState("");
  const [result, setResult] = useState<LessonActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitCompletion = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await completeTutorLessonAction({
        lessonId,
        attended:
          attendance === "attended"
            ? true
            : attendance === "missed"
              ? false
              : undefined,
        lessonNotes,
        concernFlag,
        concernNote
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Attendance
          </span>
          <select
            value={attendance}
            onChange={(event) =>
              setAttendance(event.target.value as AttendanceValue)
            }
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select attendance</option>
            <option value="attended">Attended</option>
            <option value="missed">Missed / did not attend</option>
          </select>
          {result?.fieldErrors?.attended ? (
            <p className="text-xs text-danger">{result.fieldErrors.attended}</p>
          ) : null}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Lesson notes
          </span>
          <textarea
            value={lessonNotes}
            onChange={(event) => setLessonNotes(event.target.value)}
            rows={5}
            placeholder="Summarize what was covered, how the student responded, and what should happen next."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {result?.fieldErrors?.lessonNotes ? (
            <p className="text-xs text-danger">
              {result.fieldErrors.lessonNotes}
            </p>
          ) : null}
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-soft-cream/50 p-4 md:col-span-2">
          <input
            type="checkbox"
            checked={concernFlag}
            onChange={(event) => setConcernFlag(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-royal-blue"
          />
          <span>
            <span className="block text-sm font-semibold text-deep-navy">
              Flag a learning concern
            </span>
            <span className="mt-1 block text-sm text-text-secondary">
              Use this when TopMox should pay attention to attendance,
              confidence, concept gaps, or follow-through.
            </span>
          </span>
        </label>

        {concernFlag ? (
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-deep-navy">
              Concern note
            </span>
            <textarea
              value={concernNote}
              onChange={(event) => setConcernNote(event.target.value)}
              rows={4}
              placeholder="Explain the concern clearly so TopMox can decide the right follow-up."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {result?.fieldErrors?.concernNote ? (
              <p className="text-xs text-danger">
                {result.fieldErrors.concernNote}
              </p>
            ) : null}
          </label>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={submitCompletion}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Complete Lesson
      </Button>

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
    </div>
  );
}
