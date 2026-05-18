import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ACTIVE_PAYMENT_METHODS,
  DEFAULT_PAYMENT_CURRENCY,
  SUPPORTED_PAYMENT_CURRENCIES,
  isSupportedPaymentCurrency
} from "@/lib/constants/payments";

describe("payment constants", () => {
  test("Flutterwave is accepted as the primary live gateway", () => {
    const methods: readonly string[] = ACTIVE_PAYMENT_METHODS;

    assert.equal(methods.includes("FLUTTERWAVE"), true);
  });

  test("manual transfer remains available as fallback", () => {
    const methods: readonly string[] = ACTIVE_PAYMENT_METHODS;

    assert.equal(methods.includes("MANUAL_TRANSFER"), true);
  });

  test("Stripe is not part of the active payment method list", () => {
    const methods: readonly string[] = ACTIVE_PAYMENT_METHODS;

    assert.equal(methods.includes("STRIPE"), false);
  });

  test("supports regional display and payment currencies", () => {
    const currencies: readonly string[] = SUPPORTED_PAYMENT_CURRENCIES;

    for (const currency of ["NGN", "USD", "GBP", "EUR", "CAD", "AUD", "AED"]) {
      assert.equal(isSupportedPaymentCurrency(currency), true);
      assert.equal(currencies.includes(currency), true);
    }
  });

  test("rejects unsupported currencies", () => {
    assert.equal(isSupportedPaymentCurrency("JPY"), false);
  });

  test("defaults to Nigeria NGN for safe fallback payments", () => {
    assert.equal(DEFAULT_PAYMENT_CURRENCY, "NGN");
  });
});
