"use client";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: AuthErrorProps) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      context="auth-route-error"
      description="We could not load the account page safely. Please try again or return home."
    />
  );
}
