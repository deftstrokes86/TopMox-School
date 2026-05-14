const items = [
  "Experienced educators",
  "Structured learning plans",
  "Parent visibility and reports",
  "Flexible lessons across time zones"
];

export function TrustStrip() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-xl border border-border bg-white p-4 text-sm font-medium text-text-secondary shadow-soft"
        >
          {item}
        </div>
      ))}
    </section>
  );
}
