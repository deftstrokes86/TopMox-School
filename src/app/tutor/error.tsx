"use client";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type TutorErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TutorError({ error, reset }: TutorErrorProps) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      context="tutor-route-error"
      description="The tutor workspace could not load safely. Please retry or return to your tutor dashboard."
      homeHref="/tutor"
      homeLabel="Back to tutor dashboard"
    />
  );
}
