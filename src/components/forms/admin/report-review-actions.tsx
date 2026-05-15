"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  publishProgressReportAction,
  returnProgressReportToDraftAction,
  type ReportActionResult
} from "@/server/actions/report.actions";

type ReportReviewActionsProps = {
  reportId: string;
};

export function ReportReviewActions({ reportId }: ReportReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReportActionResult | null>(null);

  const publishReport = () => {
    const confirmed = window.confirm(
      "Publish this progress report to the parent?"
    );

    if (!confirmed) {
      return;
    }

    setResult(null);

    startTransition(async () => {
      const actionResult = await publishProgressReportAction({ reportId });
      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  const returnToDraft = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await returnProgressReportToDraftAction({ reportId });
      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          onClick={publishReport}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Publish Report
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={returnToDraft}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Return to Draft
        </Button>
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
    </div>
  );
}
