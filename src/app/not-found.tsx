import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background bg-brand-sheen px-4 py-12">
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-royal-blue">
            {BRAND.PRODUCT_NAME}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-deep-navy">
            Page not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
            This page may have moved, or the link may no longer be available.
            You can return home and continue from a safe place.
          </p>
          <div className="mt-7">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
