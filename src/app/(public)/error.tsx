"use client";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: PublicErrorProps) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      context="public-route-error"
      description="We could not load this public TopMox page. Please try again or return home."
    />
  );
}
