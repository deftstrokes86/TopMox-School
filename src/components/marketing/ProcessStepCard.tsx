type ProcessStepCardProps = {
  step: string;
  title: string;
  description: string;
};

export function ProcessStepCard({
  step,
  title,
  description
}: ProcessStepCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <p className="inline-flex rounded-full bg-soft-gold px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-deep-navy">
        {step}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </article>
  );
}
