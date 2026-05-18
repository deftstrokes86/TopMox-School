import Link from "next/link";
import { cookies, headers } from "next/headers";

import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { REGION_COOKIE_NAME } from "@/lib/constants/locations";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants/navigation";
import { resolveVisitorRegion } from "@/server/services/location.service";

export function PublicHeader() {
  const resolvedRegion = resolveVisitorRegion({
    headers: headers(),
    cookie: cookies().get(REGION_COOKIE_NAME)?.value
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-deep-navy lg:text-base"
        >
          {BRAND.PRODUCT_NAME}
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <RegionSwitcher
            currentRegionCode={resolvedRegion.region.code}
            compact
          />
          <Button asChild size="sm">
            <Link href="/book-assessment">{BRAND.PRIMARY_CTA}</Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-border/70 bg-white xl:hidden">
        <div className="container space-y-2 overflow-x-auto py-2">
          <div className="md:hidden">
            <RegionSwitcher
              currentRegionCode={resolvedRegion.region.code}
              compact
            />
          </div>
          <nav className="flex min-w-max items-center gap-4 pr-3">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
