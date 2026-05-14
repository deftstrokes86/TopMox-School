type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  items: FAQItem[];
};

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-border bg-white p-4 shadow-soft"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-text-primary">
            {item.question}
          </summary>
          <p className="mt-2 text-sm text-text-secondary">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
