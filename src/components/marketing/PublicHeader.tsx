import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants/navigation";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-deep-navy"
        >
          {BRAND.PRODUCT_NAME}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {PUBLIC_NAV_ITEMS.slice(0, 7).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/book-assessment">{BRAND.PRIMARY_CTA}</Link>
        </Button>
      </div>
    </header>
  );
}
