type SubjectSupportCardProps = {
  subject: string;
  outcome: string;
};

export function SubjectSupportCard({ subject, outcome }: SubjectSupportCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-text-primary">{subject}</h3>
      <p className="mt-2 text-sm text-text-secondary">{outcome}</p>
    </article>
  );
}
