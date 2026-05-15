"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookOpenCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  assignHomeworkAction,
  type HomeworkActionResult
} from "@/server/actions/homework.actions";

type HomeworkAssignmentFormProps = {
  lessonId: string;
};

export function HomeworkAssignmentForm({ lessonId }: HomeworkAssignmentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [result, setResult] = useState<HomeworkActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const assignHomework = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await assignHomeworkAction({
        lessonId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined
      });

      setResult(actionResult);

      if (actionResult.success) {
        setTitle("");
        setDescription("");
        setDueDate("");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Homework title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Fractions practice"
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.title ? (
            <p className="text-xs text-danger">{result.fieldErrors.title}</p>
          ) : null}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Tell the parent and child exactly what should be completed before the next lesson."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {result?.fieldErrors?.description ? (
            <p className="text-xs text-danger">
              {result.fieldErrors.description}
            </p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">
            Due date optional
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.dueDate ? (
            <p className="text-xs text-danger">{result.fieldErrors.dueDate}</p>
          ) : null}
        </label>
      </div>

      <Button
        type="button"
        onClick={assignHomework}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BookOpenCheck className="mr-2 h-4 w-4" />
        )}
        Assign Homework
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
