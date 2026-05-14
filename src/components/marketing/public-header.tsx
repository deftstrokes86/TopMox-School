import Link from "next/link";

import { Button } from "@/components/shared/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="h-18 container flex items-center justify-between py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-slate-900"
        >
          TopMox Global Tutoring
        </Link>
        <Button size="sm">Book a Child Assessment</Button>
      </div>
    </header>
  );
}
