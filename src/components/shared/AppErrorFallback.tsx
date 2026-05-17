"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { logError } from "@/lib/utils/logger";

type AppErrorFallbackProps = {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  context?: string;
};

export function AppErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "We hit an unexpected issue while loading this page. Please try again, or return to a safe page.",
  homeHref = "/",
  homeLabel = "Back to home",
  context = "app-error"
}: AppErrorFallbackProps) {
  useEffect(() => {
    if (error) {
      logError(error, context);
    }
  }, [context, error]);

  return (
    <main className="min-h-screen bg-background bg-brand-sheen px-4 py-12">
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-royal-blue">
            {BRAND.PRODUCT_NAME}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-deep-navy sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
            {description}
          </p>

          {process.env.NODE_ENV === "development" && error ? (
            <pre className="mt-5 max-h-48 overflow-auto rounded-lg border border-danger/20 bg-danger/5 p-4 text-xs text-danger">
              {error.message}
            </pre>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {reset ? (
              <Button type="button" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={homeHref}>
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                {homeLabel}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
