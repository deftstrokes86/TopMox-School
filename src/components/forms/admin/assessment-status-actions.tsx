"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import type { AssessmentStatusValue } from "@/lib/utils/assessment-status";
import {
  markAssessmentCompletedAction,
  updateAssessmentStatusAction,
  type AssessmentActionResult
} from "@/server/actions/assessment.actions";

type AssessmentStatusActionsProps = {
  assessmentRequestId: string;
  status: AssessmentStatusValue;
};

type PendingAction = "complete" | "decline" | null;

export function AssessmentStatusActions({
  assessmentRequestId,
  status
}: AssessmentStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [result, setResult] = useState<AssessmentActionResult | null>(null);

  const runAction = (action: Exclude<PendingAction, null>) => {
    setResult(null);
    setPendingAction(null);

    startTransition(async () => {
      const actionResult =
        action === "complete"
          ? await markAssessmentCompletedAction(assessmentRequestId)
          : await updateAssessmentStatusAction({
              assessmentRequestId,
              status: "DECLINED"
            });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  const canDecline = status === "PENDING_REVIEW" || status === "SCHEDULED";
  const canComplete = status === "SCHEDULED";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {canComplete ? (
          <Button
            type="button"
            onClick={() => setPendingAction("complete")}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Mark Completed
          </Button>
        ) : null}

        {canDecline ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setPendingAction("decline")}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Decline Request
          </Button>
        ) : null}

        {status === "COMPLETED" ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/assessments/${assessmentRequestId}/outcome`}>
              Record Outcome
            </Link>
          </Button>
        ) : null}

        {status === "PLAN_RECOMMENDED" ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/assessments/${assessmentRequestId}/outcome`}>
              Edit Recommendation
            </Link>
          </Button>
        ) : null}

        {status === "PLAN_RECOMMENDED" ? (
          <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            A plan has been recommended. Plan acceptance is intentionally
            deferred to a later phase.
          </p>
        ) : null}

        {status === "CONVERTED" ? (
          <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            This assessment has converted into the tutoring journey.
          </p>
        ) : null}

        {status === "DECLINED" ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            This request has been declined and is read-only.
          </p>
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

      <ConfirmDialog
        open={pendingAction === "complete"}
        title="Mark assessment completed?"
        description="This confirms the assessment has taken place and moves the request toward outcome recording."
        confirmLabel="Mark Completed"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => runAction("complete")}
      />

      <ConfirmDialog
        open={pendingAction === "decline"}
        title="Decline assessment request?"
        description="This stops the request from moving forward. Use this only when TopMox should not continue with this assessment request."
        confirmLabel="Decline Request"
        confirmTone="destructive"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => runAction("decline")}
      />
    </div>
  );
}
