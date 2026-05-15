"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  acceptRecommendedPlanAction,
  type EnrollmentActionResult
} from "@/server/actions/enrollment.actions";

type AcceptRecommendedPlanButtonProps = {
  assessmentRequestId: string;
  recommendedPlanId: string;
};

export function AcceptRecommendedPlanButton({
  assessmentRequestId,
  recommendedPlanId
}: AcceptRecommendedPlanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<EnrollmentActionResult | null>(null);

  const handleAccept = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await acceptRecommendedPlanAction({
        assessmentRequestId,
        recommendedPlanId
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.push("/parent/enrollments?accepted=1");
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleAccept}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Accepting plan...
          </>
        ) : (
          <>
            Accept Recommended Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {result?.success ? (
        <p className="inline-flex items-center rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Your plan has been accepted. Submit payment details so TopMox can
          verify and activate your child&apos;s tutoring plan.
        </p>
      ) : null}

      {result && !result.success ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
