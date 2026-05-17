"use client";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type ParentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ParentError({ error, reset }: ParentErrorProps) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      context="parent-route-error"
      description="The parent workspace could not load safely. Please retry or return to your parent dashboard."
      homeHref="/parent"
      homeLabel="Back to parent dashboard"
    />
  );
}
