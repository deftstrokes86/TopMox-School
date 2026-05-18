import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ChevronDown } from "lucide-react";

import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { REGION_COOKIE_NAME } from "@/lib/constants/locations";
import {
  PUBLIC_ABOUT_MENU_ITEMS,
  PUBLIC_NAV_ITEMS
} from "@/lib/constants/navigation";
import { resolveVisitorRegion } from "@/server/services/location.service";

function MainNavLinks({ className = "" }: { className?: string }) {
  return (
    <>
      {PUBLIC_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-public-main-nav-item
          className={`rounded-full px-3.5 py-2 text-sm font-semibold text-text-secondary transition hover:-translate-y-0.5 hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25 ${className}`}
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
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-deep-navy transition hover:text-royal-blue lg:text-base"
        >
          {BRAND.PRODUCT_NAME}
        </Link>

        <nav
          data-testid="public-desktop-nav"
          className="hidden items-center gap-1 rounded-full border border-border/80 bg-white/85 p-1 shadow-soft xl:flex"
          aria-label="Main navigation"
        >
          <MainNavLinks />
          <div className="group relative">
            <button
              type="button"
              data-testid="public-about-menu-trigger"
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-text-secondary transition hover:-translate-y-0.5 hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25"
            >
              About
              <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-border bg-white p-2 opacity-0 shadow-lifted transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {PUBLIC_ABOUT_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-text-secondary transition hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
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
          <nav
            data-testid="public-mobile-nav"
            className="flex min-w-max items-center gap-2 pr-3"
            aria-label="Mobile navigation"
          >
            <MainNavLinks className="whitespace-nowrap text-xs" />
            <details className="group relative">
              <summary
                data-testid="public-about-menu-trigger"
                className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-text-secondary transition hover:bg-soft-blue hover:text-deep-navy"
              >
                About
                <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
              </summary>
              <div className="absolute left-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-white p-2 shadow-lifted">
                {PUBLIC_ABOUT_MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-xs font-semibold text-text-secondary hover:bg-soft-blue hover:text-deep-navy"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </nav>
        </div>
      </div>
    </header>
  );
}
