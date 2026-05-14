import Link from "next/link";

import type { NavigationItem } from "@/lib/constants/navigation";

type MobileDashboardNavProps = {
  items: NavigationItem[];
};

export function MobileDashboardNav({ items }: MobileDashboardNavProps) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-md px-3 py-2 text-center text-xs font-medium text-text-secondary hover:bg-soft-cream hover:text-text-primary"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
