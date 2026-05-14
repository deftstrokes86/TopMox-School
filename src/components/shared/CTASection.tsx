import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";

type CTASectionProps = {
  title: string;
  description: string;
  primaryHref?: string;
  secondaryHref?: string;
};

export function CTASection({
  title,
  description,
  primaryHref = "/book-assessment",
  secondaryHref = "/pricing"
}: CTASectionProps) {
  return (
    <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2E70C2] p-6 text-white shadow-lifted md:p-10">
      <div className="max-w-3xl space-y-4">
        <h3 className="text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h3>
        <p className="text-sm text-blue-50/90 md:text-base">{description}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="bg-white text-deep-navy hover:bg-white/90">
          <Link href={primaryHref}>{BRAND.PRIMARY_CTA}</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-white/60 bg-white/10 text-white hover:bg-white/20"
        >
          <Link href={secondaryHref}>{BRAND.SECONDARY_CTA}</Link>
        </Button>
      </div>
    </section>
  );
}
