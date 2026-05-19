"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  title: string;
  items: NavigationItem[];
  className?: string;
};

export function DashboardSidebar({
  title,
  items,
  className
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden w-64 border-r border-border bg-soft-cream/70 p-5 lg:block",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
        {title}
      </p>
      <nav className="mt-4 space-y-1">
        {items.map((item) => {
          const isActive = isActiveDashboardRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-white hover:text-text-primary",
                isActive ? "bg-white text-text-primary shadow-sm" : null
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function isActiveDashboardRoute(pathname: string, href: string) {
  if (href === "/admin" || href === "/parent" || href === "/tutor") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
