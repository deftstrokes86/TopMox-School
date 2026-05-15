"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Save, XCircle } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentStatusValue } from "@/lib/utils/payment-status";
import {
  reviewPaymentAction,
  updatePaymentAdminNoteAction,
  type PaymentActionResult
} from "@/server/actions/payment.actions";

type PaymentReviewActionsProps = {
  paymentId: string;
  status: PaymentStatusValue;
  initialAdminNote?: string | null;
};

type PendingReviewAction = "approve" | "reject" | null;

export function PaymentReviewActions({
  paymentId,
  status,
  initialAdminNote
}: PaymentReviewActionsProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState(initialAdminNote ?? "");
  const [pendingReviewAction, setPendingReviewAction] =
    useState<PendingReviewAction>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PaymentActionResult | null>(null);
  const canReview = status === "AWAITING_VERIFICATION";

  const runReview = (action: Exclude<PendingReviewAction, null>) => {
    setResult(null);
    setPendingReviewAction(null);

    startTransition(async () => {
      const actionResult = await reviewPaymentAction({
        paymentId,
        decision: action === "approve" ? "APPROVE" : "REJECT",
        adminNote
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  const saveAdminNote = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await updatePaymentAdminNoteAction({
        paymentId,
        adminNote
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="payment-admin-note">Admin note</Label>
        <Textarea
          id="payment-admin-note"
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          placeholder="Add verification notes. If rejecting, explain what the parent should review or resend."
        />
        <p className="text-xs text-text-muted">
          Admin notes are visible to the parent on the payment detail page.
        </p>
        {result?.fieldErrors?.adminNote ? (
          <p className="text-xs text-danger">{result.fieldErrors.adminNote}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={saveAdminNote}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Admin Note
        </Button>

        {canReview ? (
          <>
            <Button
              type="button"
              onClick={() => setPendingReviewAction("approve")}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve Payment
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingReviewAction("reject")}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Payment
            </Button>
          </>
        ) : (
          <p className="rounded-lg border border-border bg-soft-cream/50 p-3 text-sm text-text-secondary">
            This payment has already been reviewed. Further approval or
            rejection actions are disabled.
          </p>
        )}
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
        open={pendingReviewAction === "approve"}
        title="Approve this payment?"
        description="This marks the payment as paid and activates the linked tutoring enrollment. Lessons are still scheduled in a later phase."
        confirmLabel="Approve Payment"
        onCancel={() => setPendingReviewAction(null)}
        onConfirm={() => runReview("approve")}
      />

      <ConfirmDialog
        open={pendingReviewAction === "reject"}
        title="Reject this payment?"
        description="This marks the payment as failed. Add an admin note first so the parent knows what to review or resend."
        confirmLabel="Reject Payment"
        confirmTone="destructive"
        onCancel={() => setPendingReviewAction(null)}
        onConfirm={() => runReview("reject")}
      />
    </div>
  );
}
