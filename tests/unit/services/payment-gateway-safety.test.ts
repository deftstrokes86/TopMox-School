import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertPaymentAmountAndCurrencyMatch,
  getPaymentProviderAdapter,
  isDuplicatePaymentEvent,
  validateVerifiedGatewayPaymentForActivation
} from "@/server/services/payment.service";

describe("payment gateway safety", () => {
  test("resolves Flutterwave and manual adapters but rejects Stripe", () => {
    assert.equal(getPaymentProviderAdapter("FLUTTERWAVE").provider, "FLUTTERWAVE");
    assert.equal(getPaymentProviderAdapter("MANUAL").provider, "MANUAL");
    assert.throws(() => getPaymentProviderAdapter("STRIPE"), /Unsupported payment provider/);
  });

  test("amount and currency must match enrollment plan before activation", () => {
    assert.doesNotThrow(() =>
      assertPaymentAmountAndCurrencyMatch({
        expectedAmount: "95000.00",
        expectedCurrency: "NGN",
        actualAmount: "95000",
        actualCurrency: "ngn"
      })
    );

    assert.throws(
      () =>
        assertPaymentAmountAndCurrencyMatch({
          expectedAmount: "95000.00",
          expectedCurrency: "NGN",
          actualAmount: "94000.00",
          actualCurrency: "NGN"
        }),
      /Payment amount mismatch/
    );

    assert.throws(
      () =>
        assertPaymentAmountAndCurrencyMatch({
          expectedAmount: "95000.00",
          expectedCurrency: "NGN",
          actualAmount: "95000.00",
          actualCurrency: "USD"
        }),
      /Payment currency mismatch/
    );
  });

  test("creating a Flutterwave payment does not activate enrollment by itself", () => {
    const result = validateVerifiedGatewayPaymentForActivation({
      provider: "FLUTTERWAVE",
      paymentStatus: "PENDING",
      enrollmentStatus: "PENDING_PAYMENT",
      verificationStatus: "pending",
      expectedAmount: "125.00",
      expectedCurrency: "USD",
      actualAmount: "125.00",
      actualCurrency: "USD"
    });

    assert.equal(result.success, false);
    assert.equal(result.nextEnrollmentStatus, "PENDING_PAYMENT");
  });

  test("verified successful Flutterwave payment can activate enrollment", () => {
    const result = validateVerifiedGatewayPaymentForActivation({
      provider: "FLUTTERWAVE",
      paymentStatus: "PENDING",
      enrollmentStatus: "PENDING_PAYMENT",
      verificationStatus: "successful",
      expectedAmount: "125.00",
      expectedCurrency: "USD",
      actualAmount: "125",
      actualCurrency: "usd"
    });

    assert.equal(result.success, true);
    assert.equal(result.nextPaymentStatus, "PAID");
    assert.equal(result.nextEnrollmentStatus, "ACTIVE");
  });

  test("manual payment cannot auto-activate through gateway verification", () => {
    const result = validateVerifiedGatewayPaymentForActivation({
      provider: "MANUAL",
      paymentStatus: "AWAITING_VERIFICATION",
      enrollmentStatus: "PENDING_PAYMENT",
      verificationStatus: "successful",
      expectedAmount: "125.00",
      expectedCurrency: "GBP",
      actualAmount: "125.00",
      actualCurrency: "GBP"
    });

    assert.equal(result.success, false);
    assert.equal(result.nextEnrollmentStatus, "PENDING_PAYMENT");
  });

  test("duplicate payment events are detected for webhook and callback idempotency", () => {
    assert.equal(
      isDuplicatePaymentEvent({
        existingProviderEventId: "evt-123",
        currentProviderEventId: "evt-123"
      }),
      true
    );

    assert.equal(
      isDuplicatePaymentEvent({
        existingProviderEventId: null,
        currentProviderEventId: "evt-123"
      }),
      false
    );
  });

  test("duplicate verification does not create a second paid transition", () => {
    const result = validateVerifiedGatewayPaymentForActivation({
      provider: "FLUTTERWAVE",
      paymentStatus: "PAID",
      enrollmentStatus: "ACTIVE",
      verificationStatus: "successful",
      expectedAmount: "125.00",
      expectedCurrency: "CAD",
      actualAmount: "125.00",
      actualCurrency: "CAD"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Payment has already been processed.");
    assert.equal(result.nextPaymentStatus, "PAID");
    assert.equal(result.nextEnrollmentStatus, "ACTIVE");
  });
});
