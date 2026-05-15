import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getFlutterwaveCheckoutUpdateData,
  getFlutterwavePendingPaymentData,
  getManualPaymentData,
  validateEnrollmentPaymentRequest
} from "@/server/services/payment.service";

const validRequest = {
  currentUserId: "parent-user-id",
  enrollmentParentUserId: "parent-user-id",
  enrollmentStatus: "PENDING_PAYMENT" as const,
  existingOpenPaymentId: null
};

describe("parent enrollment checkout guard", () => {
  test("allows a parent to create checkout for their own pending enrollment", () => {
    const result = validateEnrollmentPaymentRequest(validRequest);

    assert.equal(result.success, true);
  });

  test("blocks checkout for another parent's enrollment", () => {
    const result = validateEnrollmentPaymentRequest({
      ...validRequest,
      currentUserId: "other-parent-user-id"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Enrollment not found.");
  });

  test("blocks checkout for an active enrollment", () => {
    const result = validateEnrollmentPaymentRequest({
      ...validRequest,
      enrollmentStatus: "ACTIVE"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.enrollmentId,
      "This tutoring plan is not awaiting payment."
    );
  });

  test("prevents duplicate open payment attempts for the same enrollment", () => {
    const result = validateEnrollmentPaymentRequest({
      ...validRequest,
      existingOpenPaymentId: "existing-payment-id"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.enrollmentId,
      "Payment is already in progress for this plan."
    );
  });
});

describe("parent checkout payment data", () => {
  test("Flutterwave payment starts pending and derives amount/currency from the plan", () => {
    const paymentData = getFlutterwavePendingPaymentData({
      parentId: "parent-profile-id",
      studentId: "student-id",
      enrollmentId: "enrollment-id",
      amount: "125.00",
      currency: "USD",
      callbackUrl: "https://topmox.test/parent/payments",
      metadata: {
        source: "parent_checkout"
      }
    });

    assert.equal(paymentData.status, "PENDING");
    assert.equal(paymentData.paymentMethod, "FLUTTERWAVE");
    assert.equal(paymentData.provider, "FLUTTERWAVE");
    assert.equal(paymentData.amount, "125.00");
    assert.equal(paymentData.currency, "USD");
  });

  test("Flutterwave checkout stores provider reference and checkout URL", () => {
    const updateData = getFlutterwaveCheckoutUpdateData({
      provider: "FLUTTERWAVE",
      providerReference: "topmox-payment-id",
      checkoutUrl: "https://checkout.flutterwave.com/pay/topmox",
      status: "PENDING",
      shouldActivateEnrollment: false,
      rawPayload: {
        status: "success"
      }
    });

    assert.equal(updateData.providerReference, "topmox-payment-id");
    assert.equal(updateData.reference, "topmox-payment-id");
    assert.equal(
      updateData.checkoutUrl,
      "https://checkout.flutterwave.com/pay/topmox"
    );
  });

  test("manual fallback starts awaiting verification and never activates enrollment", () => {
    const paymentData = getManualPaymentData({
      parentId: "parent-profile-id",
      studentId: "student-id",
      enrollmentId: "enrollment-id",
      amount: "95000.00",
      currency: "NGN",
      paymentMethod: "MANUAL_TRANSFER",
      reference: "TMX-001",
      proofUrl: "https://example.com/proof"
    });

    assert.equal(paymentData.status, "AWAITING_VERIFICATION");
    assert.equal(paymentData.provider, "MANUAL");
    assert.equal(paymentData.paymentMethod, "MANUAL_TRANSFER");
  });
});
