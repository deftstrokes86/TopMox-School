"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateAssessmentInternalNotesAction,
  type AssessmentActionResult
} from "@/server/actions/assessment.actions";

type AssessmentInternalNotesFormProps = {
  assessmentRequestId: string;
  initialNotes?: string | null;
};

export function AssessmentInternalNotesForm({
  assessmentRequestId,
  initialNotes
}: AssessmentInternalNotesFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssessmentActionResult | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);

    startTransition(async () => {
      const actionResult = await updateAssessmentInternalNotesAction({
        assessmentRequestId,
        internalNotes: notes
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="internal-notes">Internal notes</Label>
        <Textarea
          id="internal-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add operational notes for the TopMox team. These notes are not shown to parents."
        />
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
            Saving notes...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Internal Notes
          </>
        )}
      </Button>
    </form>
  );
}
