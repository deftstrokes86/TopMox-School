import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  PaymentStatusTransitionError,
  assertPaymentStatusTransition,
  canTransitionPaymentStatus,
  getEnrollmentActivatedNotificationPayload,
  getAdminPaymentSubmittedNotificationPayload,
  getManualPaymentData,
  getPaymentApprovedNotificationPayload,
  getPaymentRejectedNotificationPayload,
  getParentPaymentSubmittedNotificationPayload,
  validateManualPaymentSubmission,
  validatePaymentReview
} from "@/server/services/payment.service";

const validSubmission = {
  currentUserId: "parent-user-id",
  enrollmentParentUserId: "parent-user-id",
  enrollmentStatus: "PENDING_PAYMENT" as const,
  existingVerificationPaymentId: null
};

describe("manual payment submission guard", () => {
  test("allows an owning parent to submit payment for pending enrollment", () => {
    const result = validateManualPaymentSubmission(validSubmission);

    assert.equal(result.success, true);
  });

  test("blocks another parent's enrollment", () => {
    const result = validateManualPaymentSubmission({
      ...validSubmission,
      currentUserId: "other-parent-user-id"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Enrollment not found.");
  });

  test("blocks non-pending enrollments", () => {
    const result = validateManualPaymentSubmission({
      ...validSubmission,
      enrollmentStatus: "ACTIVE"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.enrollmentId,
      "This tutoring plan is not awaiting payment."
    );
  });

  test("blocks duplicate verification payment submissions", () => {
    const result = validateManualPaymentSubmission({
      ...validSubmission,
      existingVerificationPaymentId: "payment-id"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.enrollmentId,
      "Payment is already under review for this plan."
    );
  });

  test("new manual payment starts as awaiting verification", () => {
    const data = getManualPaymentData({
      parentId: "parent-profile-id",
      studentId: "student-id",
      enrollmentId: "enrollment-id",
      amount: "75000.00",
      currency: "NGN",
      paymentMethod: "BANK_TRANSFER",
      reference: "TMX-001",
      proofUrl: ""
    });

    assert.equal(data.status, "AWAITING_VERIFICATION");
    assert.equal(data.amount, "75000.00");
    assert.equal(data.reference, "TMX-001");
    assert.equal(data.proofUrl, null);
  });

  test("payment notifications use payment workflow links", () => {
    const parentPayload = getParentPaymentSubmittedNotificationPayload("payment-id");
    const adminPayload = getAdminPaymentSubmittedNotificationPayload({
      parentName: "Ada Parent",
      childName: "Timi Parent",
      planName: "Growth Plan"
    });

    assert.equal(parentPayload.type, "PAYMENT_SUBMITTED");
    assert.match(parentPayload.href, /payment-id/);
    assert.equal(adminPayload.type, "PAYMENT_SUBMITTED");
    assert.match(adminPayload.message, /Growth Plan/);
  });
});

describe("payment review status transitions", () => {
  test("awaiting verification can transition to paid or failed", () => {
    assert.equal(
      canTransitionPaymentStatus("AWAITING_VERIFICATION", "PAID"),
      true
    );
    assert.equal(
      canTransitionPaymentStatus("AWAITING_VERIFICATION", "FAILED"),
      true
    );
  });

  test("paid can transition to refunded", () => {
    assert.equal(canTransitionPaymentStatus("PAID", "REFUNDED"), true);
  });

  test("invalid payment transitions are blocked", () => {
    assert.equal(canTransitionPaymentStatus("PAID", "FAILED"), false);
    assert.throws(
      () => assertPaymentStatusTransition("PAID", "FAILED"),
      PaymentStatusTransitionError
    );
  });
});

describe("payment review guard", () => {
  const validReview = {
    currentRole: "ADMIN" as const,
    paymentStatus: "AWAITING_VERIFICATION" as const,
    enrollmentStatus: "PENDING_PAYMENT" as const,
    decision: "APPROVE" as const
  };

  test("admin can approve an awaiting verification payment", () => {
    const result = validatePaymentReview(validReview);

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.nextPaymentStatus, "PAID");
      assert.equal(result.nextEnrollmentStatus, "ACTIVE");
    }
  });

  test("payment approval activates enrollment", () => {
    const result = validatePaymentReview(validReview);

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.nextEnrollmentStatus, "ACTIVE");
    }
  });

  test("payment rejection does not activate enrollment", () => {
    const result = validatePaymentReview({
      ...validReview,
      decision: "REJECT"
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal(result.nextPaymentStatus, "FAILED");
      assert.equal(result.nextEnrollmentStatus, "PENDING_PAYMENT");
    }
  });

  test("non-admin cannot approve payment", () => {
    const result = validatePaymentReview({
      ...validReview,
      currentRole: "PARENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.paymentId, "Only admins can review payments.");
  });

  test("already reviewed payment cannot be approved again", () => {
    const result = validatePaymentReview({
      ...validReview,
      paymentStatus: "PAID"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.paymentId,
      "Only payments awaiting verification can be reviewed."
    );
  });

  test("payment approval notifications describe activation", () => {
    const approvedPayload = getPaymentApprovedNotificationPayload("payment-id");
    const activatedPayload =
      getEnrollmentActivatedNotificationPayload("enrollment-id");
    const rejectedPayload = getPaymentRejectedNotificationPayload("payment-id");

    assert.equal(approvedPayload.type, "PAYMENT_APPROVED");
    assert.match(approvedPayload.message, /active/);
    assert.equal(activatedPayload.type, "ENROLLMENT_ACTIVATED");
    assert.match(activatedPayload.href, /enrollments/);
    assert.equal(rejectedPayload.type, "PAYMENT_REJECTED");
  });
});
