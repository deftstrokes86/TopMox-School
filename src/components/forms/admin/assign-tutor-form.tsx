"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  assignTutorToEnrollmentAction,
  type TutorAssignmentActionResult
} from "@/server/actions/tutor.actions";

type TutorOption = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  subjects: {
    name: string;
  }[];
};

type AssignTutorFormProps = {
  enrollmentId: string;
  tutors: TutorOption[];
  initialTutorId?: string | null;
  disabled?: boolean;
};

export function AssignTutorForm({
  enrollmentId,
  tutors,
  initialTutorId,
  disabled
}: AssignTutorFormProps) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState(initialTutorId ?? "");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TutorAssignmentActionResult | null>(null);

  const submitAssignment = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await assignTutorToEnrollmentAction({
        enrollmentId,
        tutorId
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-deep-navy">
          Active tutor
        </span>
        <select
          value={tutorId}
          onChange={(event) => setTutorId(event.target.value)}
          disabled={disabled || isPending}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select a tutor</option>
          {tutors.map((tutor) => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.user.name} -{" "}
              {tutor.subjects.length > 0
                ? tutor.subjects.map((subject) => subject.name).join(", ")
                : tutor.user.email}
            </option>
          ))}
        </select>
      </label>

      {result?.fieldErrors?.tutorId ? (
        <p className="text-xs text-danger">{result.fieldErrors.tutorId}</p>
      ) : null}

      <Button
        type="button"
        onClick={submitAssignment}
        disabled={disabled || isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserCheck className="mr-2 h-4 w-4" />
        )}
        Assign Tutor
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
