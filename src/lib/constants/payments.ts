export const ACTIVE_PAYMENT_METHODS = [
  "FLUTTERWAVE",
  "MANUAL_TRANSFER"
] as const;

export const SUPPORTED_PAYMENT_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "AED"
] as const;

export const DEFAULT_PAYMENT_CURRENCY = "NGN" as const;

export type ActivePaymentMethod = (typeof ACTIVE_PAYMENT_METHODS)[number];
export type SupportedPaymentCurrency =
  (typeof SUPPORTED_PAYMENT_CURRENCIES)[number];

export function isSupportedPaymentCurrency(
  currency: string | null | undefined
): currency is SupportedPaymentCurrency {
  if (!currency) {
    return false;
  }

  return SUPPORTED_PAYMENT_CURRENCIES.includes(
    currency.toUpperCase() as SupportedPaymentCurrency
  );
}

export function assertSupportedPaymentCurrency(
  currency: string | null | undefined
): asserts currency is SupportedPaymentCurrency {
  if (!isSupportedPaymentCurrency(currency)) {
    throw new Error(`Unsupported payment currency: ${currency || "unknown"}`);
  }
}
