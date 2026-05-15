"use client";

import type { LessonStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminLessonStatusActions } from "@/lib/utils/lesson-workflow";
import {
  updateLessonStatusAction,
  type LessonActionResult
} from "@/server/actions/lesson.actions";

type LessonStatusActionsProps = {
  lessonId: string;
  status: LessonStatus;
};

export function LessonStatusActions({
  lessonId,
  status
}: LessonStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LessonActionResult | null>(null);
  const actions = getAdminLessonStatusActions(status);

  const updateStatus = (nextStatus: LessonStatus) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await updateLessonStatusAction({
        lessonId,
        status: nextStatus
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  if (actions.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-soft-cream/50 p-3 text-sm text-text-secondary">
        No admin status actions are available for this lesson state.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {actions.map((action) => (
          <Button
            key={action.status}
            type="button"
            variant={action.destructive ? "destructive" : "outline"}
            onClick={() => updateStatus(action.status)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {action.label}
          </Button>
        ))}
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
