import { cva } from "class-variance-authority";

import type { StatusTone } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const toneStyles = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-slate-100 text-slate-700",
        info: "bg-info/12 text-info",
        success: "bg-success/12 text-success",
        warning: "bg-warning/15 text-warning-foreground",
        danger: "bg-danger/12 text-danger"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

export function StatusBadge({
  label,
  tone = "neutral",
  className
}: StatusBadgeProps) {
  return <span className={cn(toneStyles({ tone }), className)}>{label}</span>;
}
