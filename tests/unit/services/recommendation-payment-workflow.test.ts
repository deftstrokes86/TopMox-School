import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getAcceptedAssessmentStatus,
  getPendingEnrollmentData,
  validateRecommendedPlanAcceptance
} from "@/server/services/enrollment.service";
import {
  getManualPaymentData,
  validateManualPaymentSubmission,
  validatePaymentReview
} from "@/server/services/payment.service";

describe("recommendation to payment workflow", () => {
  test("acceptance and approval move the workflow to active enrollment", () => {
    const acceptance = validateRecommendedPlanAcceptance({
      currentUserId: "parent-user-id",
      assessmentParentUserId: "parent-user-id",
      assessmentStatus: "PLAN_RECOMMENDED",
      outcomeRecommendedPlanId: "plan-id",
      requestedPlanId: "plan-id",
      recommendedPlanIsActive: true,
      existingEnrollmentId: null
    });

    assert.equal(acceptance.success, true);
    assert.equal(getAcceptedAssessmentStatus(), "CONVERTED");

    const enrollment = getPendingEnrollmentData({
      parentId: "parent-profile-id",
      studentId: "student-id",
      recommendedPlanId: "plan-id",
      assessmentRequestId: "assessment-id"
    });

    assert.equal(enrollment.status, "PENDING_PAYMENT");

    const paymentSubmission = validateManualPaymentSubmission({
      currentUserId: "parent-user-id",
      enrollmentParentUserId: "parent-user-id",
      enrollmentStatus: enrollment.status,
      existingVerificationPaymentId: null
    });

    assert.equal(paymentSubmission.success, true);

    const payment = getManualPaymentData({
      parentId: enrollment.parentId,
      studentId: enrollment.studentId,
      enrollmentId: "enrollment-id",
      amount: "95000.00",
      currency: "NGN",
      paymentMethod: "BANK_TRANSFER",
      reference: "TMX-PLAN-001",
      proofUrl: undefined
    });

    assert.equal(payment.status, "AWAITING_VERIFICATION");

    const approval = validatePaymentReview({
      currentRole: "ADMIN",
      paymentStatus: payment.status,
      enrollmentStatus: enrollment.status,
      decision: "APPROVE"
    });

    assert.equal(approval.success, true);

    if (approval.success) {
      assert.equal(approval.nextPaymentStatus, "PAID");
      assert.equal(approval.nextEnrollmentStatus, "ACTIVE");
    }
  });

  test("payment rejection keeps the accepted enrollment pending", () => {
    const rejection = validatePaymentReview({
      currentRole: "ADMIN",
      paymentStatus: "AWAITING_VERIFICATION",
      enrollmentStatus: "PENDING_PAYMENT",
      decision: "REJECT"
    });

    assert.equal(rejection.success, true);

    if (rejection.success) {
      assert.equal(rejection.nextPaymentStatus, "FAILED");
      assert.equal(rejection.nextEnrollmentStatus, "PENDING_PAYMENT");
    }
  });
});
