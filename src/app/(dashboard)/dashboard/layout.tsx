import type { ReactNode } from "react";
import { LayoutDashboard, Users2 } from "lucide-react";

import { Separator } from "@/components/shared/ui/separator";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="grid min-h-[70vh] lg:grid-cols-[240px_1fr]">
            <aside className="border-r border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Dashboard Shell
              </p>
              <nav className="mt-4 space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-medium">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </p>
                <p className="flex items-center gap-2 rounded-lg px-3 py-2">
                  <Users2 className="h-4 w-4" />
                  Users
                </p>
              </nav>
            </aside>
            <div>
              <header className="px-6 py-4">
                <h1 className="text-xl font-semibold">TopMox Dashboard</h1>
                <p className="text-sm text-slate-600">
                  Layout shell created in Phase 0 (no feature modules yet).
                </p>
              </header>
              <Separator />
              <section className="p-6">{children}</section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
