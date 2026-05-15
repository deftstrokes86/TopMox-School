import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getAdminPaymentSubmittedNotificationPayload,
  getManualPaymentData,
  getParentPaymentSubmittedNotificationPayload,
  validateManualPaymentSubmission
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
