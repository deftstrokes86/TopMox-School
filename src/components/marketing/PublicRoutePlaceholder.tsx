import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/SectionHeader";

type PublicRoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PublicRoutePlaceholder({
  eyebrow,
  title,
  description
}: PublicRoutePlaceholderProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft md:p-10">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/book-assessment">Book a Child Assessment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
