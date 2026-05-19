"use client";

import Link from "next/link";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import type { RegionCode } from "@/lib/constants/locations";
import type { NavigationItem } from "@/lib/constants/navigation";

type PublicMobileMenuProps = {
  currentRegionCode: RegionCode;
  navItems: NavigationItem[];
};

export function PublicMobileMenu({
  currentRegionCode,
  navItems
}: PublicMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleDrawerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }

    const focusableElements = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <>
      <button
        type="button"
        data-testid="public-menu-button"
        aria-label="Open main menu"
        aria-expanded={isOpen}
        aria-controls="public-mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-deep-navy shadow-soft transition hover:border-royal-blue/40 hover:text-royal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25 xl:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-deep-navy/35 backdrop-blur-sm xl:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            id="public-mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            data-testid="public-mobile-menu"
            className="ml-auto flex h-full w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-l-3xl border-l border-border bg-white shadow-lifted"
            onKeyDown={handleDrawerKeyDown}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {BRAND.PRODUCT_NAME}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  School-backed global tutoring
                </p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                aria-label="Close main menu"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-deep-navy transition hover:border-royal-blue/40 hover:text-royal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <RegionSwitcher currentRegionCode={currentRegionCode} compact />

              <nav className="grid gap-2" aria-label="Mobile main navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-text-secondary transition hover:bg-soft-blue hover:text-deep-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-blue/25"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-border p-5">
              <Button asChild className="w-full">
                <Link
                  href="/book-assessment"
                  onClick={() => setIsOpen(false)}
                >
                  {BRAND.PRIMARY_CTA}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
