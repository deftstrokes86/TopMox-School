const shouldLog =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true";

export function logError(error: Error, context?: string): void {
  if (!shouldLog) {
    return;
  }

  if (context) {
    console.error(`[${context}]`, error);
    return;
  }

  console.error(error);
}

export function logWarning(message: string, context?: string): void {
  if (!shouldLog) {
    return;
  }

  if (context) {
    console.warn(`[${context}] ${message}`);
    return;
  }

  console.warn(message);
}

