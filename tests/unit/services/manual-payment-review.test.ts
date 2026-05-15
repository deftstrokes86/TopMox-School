import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  canShowManualPaymentReviewActions,
  validateManualPaymentReview,
  validateVerifiedGatewayPaymentForActivation
} from "@/server/services/payment.service";

const validManualReview = {
  currentRole: "ADMIN" as const,
  paymentMethod: "MANUAL_TRANSFER" as const,
  provider: "MANUAL" as const,
  paymentStatus: "AWAITING_VERIFICATION" as const,
  enrollmentStatus: "PENDING_PAYMENT" as const,
  decision: "APPROVE" as const
};

describe("manual payment review guard", () => {
  test("admin can approve manual transfer payment awaiting verification", () => {
    const result = validateManualPaymentReview(validManualReview);

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.nextPaymentStatus, "PAID");
      assert.equal(result.nextEnrollmentStatus, "ACTIVE");
    }
  });

  test("admin can reject manual transfer payment awaiting verification", () => {
    const result = validateManualPaymentReview({
      ...validManualReview,
      decision: "REJECT"
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.nextPaymentStatus, "FAILED");
      assert.equal(result.nextEnrollmentStatus, "PENDING_PAYMENT");
    }
  });

  test("parent cannot approve payment", () => {
    const result = validateManualPaymentReview({
      ...validManualReview,
      currentRole: "PARENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.paymentId, "Only admins can review payments.");
  });

  test("tutor cannot approve payment", () => {
    const result = validateManualPaymentReview({
      ...validManualReview,
      currentRole: "TUTOR"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.paymentId, "Only admins can review payments.");
  });

  test("already reviewed manual payment cannot be reviewed again", () => {
    const result = validateManualPaymentReview({
      ...validManualReview,
      paymentStatus: "PAID"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.paymentId,
      "Only manual payments awaiting verification can be reviewed."
    );
  });

  test("Flutterwave payment cannot be manually approved through normal admin review", () => {
    const result = validateManualPaymentReview({
      ...validManualReview,
      paymentMethod: "FLUTTERWAVE",
      provider: "FLUTTERWAVE",
      paymentStatus: "PENDING"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.paymentId,
      "Flutterwave payments must be verified through provider callback or webhook."
    );
  });

  test("review actions are visible only for manual payments awaiting verification", () => {
    assert.equal(
      canShowManualPaymentReviewActions({
        paymentMethod: "MANUAL_TRANSFER",
        provider: "MANUAL",
        paymentStatus: "AWAITING_VERIFICATION"
      }),
      true
    );

    assert.equal(
      canShowManualPaymentReviewActions({
        paymentMethod: "FLUTTERWAVE",
        provider: "FLUTTERWAVE",
        paymentStatus: "PENDING"
      }),
      false
    );

    assert.equal(
      canShowManualPaymentReviewActions({
        paymentMethod: "MANUAL_TRANSFER",
        provider: "MANUAL",
        paymentStatus: "PAID"
      }),
      false
    );
  });
});

describe("Flutterwave safety remains provider verified", () => {
  test("manual provider cannot activate through gateway verification", () => {
    const result = validateVerifiedGatewayPaymentForActivation({
      provider: "MANUAL",
      paymentStatus: "AWAITING_VERIFICATION",
      enrollmentStatus: "PENDING_PAYMENT",
      verificationStatus: "successful",
      expectedAmount: "75000.00",
      expectedCurrency: "NGN",
      actualAmount: "75000.00",
      actualCurrency: "NGN"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.reason,
      "Only verified Flutterwave payments can activate automatically."
    );
  });

  test("amount mismatch blocks Flutterwave activation", () => {
    assert.throws(
      () =>
        validateVerifiedGatewayPaymentForActivation({
          provider: "FLUTTERWAVE",
          paymentStatus: "PENDING",
          enrollmentStatus: "PENDING_PAYMENT",
          verificationStatus: "successful",
          expectedAmount: "75000.00",
          expectedCurrency: "NGN",
          actualAmount: "70000.00",
          actualCurrency: "NGN"
        }),
      /Payment amount mismatch/
    );
  });

  test("currency mismatch blocks Flutterwave activation", () => {
    assert.throws(
      () =>
        validateVerifiedGatewayPaymentForActivation({
          provider: "FLUTTERWAVE",
          paymentStatus: "PENDING",
          enrollmentStatus: "PENDING_PAYMENT",
          verificationStatus: "successful",
          expectedAmount: "75000.00",
          expectedCurrency: "NGN",
          actualAmount: "75000.00",
          actualCurrency: "USD"
        }),
      /Payment currency mismatch/
    );
  });
});
