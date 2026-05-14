import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-danger/25 bg-danger/5 p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
