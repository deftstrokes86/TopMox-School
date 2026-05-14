"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background bg-brand-sheen px-4 py-12">
      <div className="container mx-auto max-w-xl">
        <div className="rounded-xl border border-border bg-card p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-royal-blue">
            TopMox Global Tutoring
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-deep-navy">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            We hit an unexpected issue while loading this page. Please try
            again, and if it continues, the TopMox team can review the logs.
          </p>

          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-danger">
              {error.message}
            </pre>
          ) : null}

          <div className="mt-6">
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
