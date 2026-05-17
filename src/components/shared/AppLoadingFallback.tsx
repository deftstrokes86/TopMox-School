import { Loader2 } from "lucide-react";

import { BRAND } from "@/lib/constants/brand";

type AppLoadingFallbackProps = {
  label?: string;
};

export function AppLoadingFallback({
  label = "Preparing TopMox Global Tutoring..."
}: AppLoadingFallbackProps) {
  return (
    <main className="min-h-screen bg-background bg-brand-sheen px-4 py-12">
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-card sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-blue/10 text-royal-blue">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-royal-blue">
            {BRAND.PRODUCT_NAME}
          </p>
          <h1 className="mt-3 text-xl font-semibold text-deep-navy">
            {label}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            We are getting the page ready with a safe loading state.
          </p>
        </section>
      </div>
    </main>
  );
}
