type RegionSupportCardProps = {
  region: string;
  detail: string;
};

export function RegionSupportCard({ region, detail }: RegionSupportCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-base font-semibold text-text-primary">{region}</h3>
      <p className="mt-2 text-sm text-text-secondary">{detail}</p>
    </article>
  );
}
