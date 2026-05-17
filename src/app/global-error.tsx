"use client";

import "@/app/globals.css";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <AppErrorFallback
          error={error}
          reset={reset}
          context="global-error"
          description="A critical app shell issue occurred. The page is protected from going blank while the error is reviewed."
        />
      </body>
    </html>
  );
}
