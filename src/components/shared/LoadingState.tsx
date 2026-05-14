import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Loading...",
  className
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-soft-cream px-3 py-2 text-sm text-text-secondary",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
