type CommonStruggleCardProps = {
  title: string;
  description: string;
};

export function CommonStruggleCard({
  title,
  description
}: CommonStruggleCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </article>
  );
}
