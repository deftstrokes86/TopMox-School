import type { ReactNode } from "react";

import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { BRAND } from "@/lib/constants/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory">
      <div className="pointer-events-none absolute inset-0 bg-brand-sheen" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8">
        <aside className="hidden space-y-6 rounded-2xl border border-deep-navy/10 bg-white/70 p-8 shadow-soft backdrop-blur-sm lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-warm-gold/40 bg-warm-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-deep-navy">
            <Sparkles className="h-3.5 w-3.5 text-warm-gold" />
            {BRAND.PARENT_BRAND}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-deep-navy">
            {BRAND.PRODUCT_NAME}
          </h1>
          <p className="text-base leading-relaxed text-text-secondary">
            School-backed online tutoring for children in Nigeria and abroad.
          </p>
          <div className="space-y-3 pt-2 text-sm text-text-secondary">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-royal-blue" />
              Trusted by families who want structured academic support.
            </p>
            <p className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-royal-blue" />
              Experienced educators and disciplined learning plans.
            </p>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-7 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              {BRAND.PARENT_BRAND}
            </p>
            <h2 className="text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
              {BRAND.PRODUCT_NAME}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              School-backed online tutoring for children in Nigeria and abroad.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
