"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  submitProgressReportForReviewAction,
  type ReportActionResult
} from "@/server/actions/report.actions";

type SubmitReportForReviewButtonProps = {
  reportId: string;
};

export function SubmitReportForReviewButton({
  reportId
}: SubmitReportForReviewButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReportActionResult | null>(null);

  const submitForReview = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await submitProgressReportForReviewAction({
        reportId
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={submitForReview}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Submit for Review
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
