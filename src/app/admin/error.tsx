"use client";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      context="admin-route-error"
      description="The admin workspace could not load safely. Please retry or return to the admin dashboard."
      homeHref="/admin"
      homeLabel="Back to admin"
    />
  );
}
