import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ChevronDown } from "lucide-react";

import { PublicMobileMenu } from "@/components/marketing/PublicMobileMenu";
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
        <span key={item.label}>
          {item.label === "About" ? (
            <details className="group relative">
              <summary
                role="button"
                aria-label="About"
                data-public-main-nav-item
                className={`list-none rounded-full px-3 py-2 text-sm font-semibold text-text-secondary transition hover:-translate-y-0.5 hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25 ${className}`}
              >
                <span className="inline-flex items-center gap-1">
                  About
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </summary>
              <div
                data-testid="public-about-dropdown"
                className="absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-border/80 bg-white p-2 shadow-lifted"
              >
                {PUBLIC_ABOUT_MENU_ITEMS.map((aboutItem) => (
                  <Link
                    key={aboutItem.href}
                    href={aboutItem.href}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25"
                  >
                    {aboutItem.label}
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <Link
              href={item.href}
              data-public-main-nav-item
              className={`rounded-full px-3 py-2 text-sm font-semibold text-text-secondary transition hover:-translate-y-0.5 hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25 ${className}`}
            >
              {item.label}
            </Link>
          )}
        </span>
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

        <div
          data-testid="public-header-actions"
          className="flex shrink-0 items-center gap-2 sm:gap-3"
        >
          <div className="hidden xl:flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login / Sign Up</Link>
            </Button>

            <div className="flex min-h-0 flex-col gap-2">
              <RegionSwitcher
                compact
                currentRegionCode={resolvedRegion.region.code}
              />
              <Button asChild size="sm">
                <Link href="/book-assessment">Book Assessment</Link>
              </Button>
            </div>
          </div>

          <PublicMobileMenu
            currentRegionCode={resolvedRegion.region.code}
            aboutItems={PUBLIC_ABOUT_MENU_ITEMS}
            navItems={PUBLIC_NAV_ITEMS}
          />
        </div>
      </div>
    </header>
  );
}
