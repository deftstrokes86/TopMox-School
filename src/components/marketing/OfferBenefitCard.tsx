import type { LucideIcon } from "lucide-react";

type OfferBenefitCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function OfferBenefitCard({
  title,
  description,
  icon: Icon
}: OfferBenefitCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cream text-royal-blue">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </article>
  );
}
