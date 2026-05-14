import Link from "next/link";

import { Button } from "@/components/ui/button";

type PlanPreviewCardProps = {
  name: string;
  bestFor: string;
  sessionsPerWeek: number;
  coreValue: string;
  ctaHref?: string;
};

export function PlanPreviewCard({
  name,
  bestFor,
  sessionsPerWeek,
  coreValue,
  ctaHref = "/pricing"
}: PlanPreviewCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
      <p className="mt-2 text-sm font-medium text-royal-blue">
        Final recommendation after assessment
      </p>
      <p className="mt-3 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">Best for:</span>{" "}
        {bestFor}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">Sessions:</span>{" "}
        {sessionsPerWeek} per week
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">Core value:</span>{" "}
        {coreValue}
      </p>
      <Button asChild className="mt-4 w-full">
        <Link href={ctaHref}>View Tutoring Plans</Link>
      </Button>
    </article>
  );
}
