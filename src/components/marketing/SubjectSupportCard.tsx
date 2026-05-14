import Link from "next/link";

import { Button } from "@/components/ui/button";

type SubjectSupportCardProps = {
  subject: string;
  outcome?: string;
  commonStruggle?: string;
  howTopMoxHelps?: string;
  parentOutcome?: string;
  href?: string;
  ctaLabel?: string;
};

export function SubjectSupportCard({
  subject,
  outcome,
  commonStruggle,
  howTopMoxHelps,
  parentOutcome,
  href,
  ctaLabel = "Learn more"
}: SubjectSupportCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-text-primary">{subject}</h3>
      {commonStruggle ? (
        <p className="mt-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Common struggle:</span>{" "}
          {commonStruggle}
        </p>
      ) : null}
      {howTopMoxHelps ? (
        <p className="mt-2 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">How TopMox helps:</span>{" "}
          {howTopMoxHelps}
        </p>
      ) : null}
      {parentOutcome ? (
        <p className="mt-2 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Parent outcome:</span>{" "}
          {parentOutcome}
        </p>
      ) : null}
      {outcome ? <p className="mt-2 text-sm text-text-secondary">{outcome}</p> : null}
      {href ? (
        <Button asChild variant="outline" className="mt-4">
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </article>
  );
}
