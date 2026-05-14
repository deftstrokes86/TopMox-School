"use client";

import { useEffect, type ReactNode } from "react";

import { logError } from "@/lib/utils/logger";

type ClientLayoutProps = {
  children: ReactNode;
};

export function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    const previousOnError = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error(
              `Unhandled window error: ${String(message)} at ${String(source)}:${lineno}:${colno}`
            );

      logError(normalizedError, "window.onerror");

      if (typeof previousOnError === "function") {
        return previousOnError(message, source, lineno, colno, error);
      }

      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const rejectionError =
        reason instanceof Error
          ? reason
          : new Error(`Unhandled promise rejection: ${String(reason)}`);

      logError(rejectionError, "window.unhandledrejection");
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.onerror = previousOnError ?? null;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

