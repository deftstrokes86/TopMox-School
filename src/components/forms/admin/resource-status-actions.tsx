"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ResourceStatus } from "@prisma/client";
import { Archive, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminResourceStatusActions } from "@/lib/utils/resource-ui";
import {
  archiveResourceAction,
  publishResourceAction,
  type ResourceActionResult
} from "@/server/actions/resource.actions";

type ResourceStatusActionsProps = {
  resourceId: string;
  status: ResourceStatus;
};

export function ResourceStatusActions({
  resourceId,
  status
}: ResourceStatusActionsProps) {
  const router = useRouter();
  const actions = getAdminResourceStatusActions(status);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ResourceActionResult | null>(null);

  const publishResource = () => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await publishResourceAction({ resourceId });
      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  const archiveResource = () => {
    const confirmed = window.confirm(
      "Archive this resource? It will no longer appear publicly."
    );

    if (!confirmed) {
      return;
    }

    setResult(null);

    startTransition(async () => {
      const actionResult = await archiveResourceAction({ resourceId });
      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  };

  if (!actions.canPublish && !actions.canArchive) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {actions.canPublish ? (
          <Button
            type="button"
            onClick={publishResource}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Publish Resource
          </Button>
        ) : null}

        {actions.canArchive ? (
          <Button
            type="button"
            variant="outline"
            onClick={archiveResource}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            Archive Resource
          </Button>
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
    </div>
  );
}
