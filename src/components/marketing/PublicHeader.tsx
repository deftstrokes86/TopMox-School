import Link from "next/link";
import { cookies, headers } from "next/headers";

import { PublicMobileMenu } from "@/components/marketing/PublicMobileMenu";
import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { REGION_COOKIE_NAME } from "@/lib/constants/locations";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants/navigation";
import { resolveVisitorRegion } from "@/server/services/location.service";

function MainNavLinks({ className = "" }: { className?: string }) {
  return (
    <>
      {PUBLIC_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-public-main-nav-item
          className={`rounded-full px-3 py-2 text-sm font-semibold text-text-secondary transition hover:-translate-y-0.5 hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25 ${className}`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function PublicHeader() {
  const resolvedRegion = resolveVisitorRegion({
    headers: headers(),
    cookie: cookies().get(REGION_COOKIE_NAME)?.value
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="min-w-0 max-w-[15rem] text-sm font-semibold tracking-wide text-deep-navy transition hover:text-royal-blue sm:max-w-none lg:text-base"
        >
          {BRAND.PRODUCT_NAME}
        </Link>

        <nav
          data-testid="public-desktop-nav"
          className="hidden min-w-0 items-center gap-0.5 rounded-full border border-border/80 bg-white/85 p-1 shadow-soft xl:flex"
          aria-label="Main navigation"
        >
          <MainNavLinks />
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <RegionSwitcher
              currentRegionCode={resolvedRegion.region.code}
              compact
            />
          </div>
          <div className="hidden xl:block">
            <Button asChild size="sm">
              <Link href="/book-assessment">{BRAND.PRIMARY_CTA}</Link>
            </Button>
          </div>
          <PublicMobileMenu
            currentRegionCode={resolvedRegion.region.code}
            navItems={PUBLIC_NAV_ITEMS}
          />
        </div>
      </div>

      <div className="border-t border-border/70 bg-white sm:hidden">
        <div className="container py-2">
          <RegionSwitcher
            currentRegionCode={resolvedRegion.region.code}
            compact
          />
        </div>
      </div>
    </header>
  );
}
