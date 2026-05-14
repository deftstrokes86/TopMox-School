import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import {
  PUBLIC_HELP_LINKS,
  PUBLIC_NAV_ITEMS,
  SUBJECT_LINKS
} from "@/lib/constants/navigation";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container space-y-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-3">
            <p className="text-base font-semibold text-text-primary">
              {BRAND.PRODUCT_NAME}
            </p>
            <p className="text-sm text-text-secondary">
              Powered by {BRAND.PARENT_BRAND}.
            </p>
            <p className="text-sm text-text-secondary">
              School-backed online tutoring for children in Nigeria and abroad.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-royal-blue">
              Public Pages
            </p>
            <div className="space-y-2">
              {[...PUBLIC_NAV_ITEMS, ...PUBLIC_HELP_LINKS].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-text-secondary hover:text-text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-royal-blue">
              Subjects
            </p>
            <div className="space-y-2">
              {SUBJECT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-text-secondary hover:text-text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-royal-blue">
              Next Step
            </p>
            <p className="text-sm text-text-secondary">
              Start with a child assessment to get a structured tutoring
              recommendation and clearer learning direction.
            </p>
            <Button asChild size="sm">
              <Link href="/book-assessment">{BRAND.PRIMARY_CTA}</Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} {BRAND.PRODUCT_NAME}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
