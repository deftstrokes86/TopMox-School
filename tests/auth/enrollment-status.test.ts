import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  EnrollmentStatusTransitionError,
  assertEnrollmentStatusTransition,
  canTransitionEnrollmentStatus,
  getAcceptedAssessmentStatus,
  getAdminPlanAcceptedNotificationPayload,
  getParentPlanAcceptedNotificationPayload,
  getPendingEnrollmentData,
  validateRecommendedPlanAcceptance
} from "@/server/services/enrollment.service";

const validAcceptance = {
  currentUserId: "parent-user-id",
  assessmentParentUserId: "parent-user-id",
  assessmentStatus: "PLAN_RECOMMENDED" as const,
  outcomeRecommendedPlanId: "plan-id",
  requestedPlanId: "plan-id",
  recommendedPlanIsActive: true,
  existingEnrollmentId: null
};

describe("enrollment status transitions", () => {
  test("PENDING_PAYMENT can transition to ACTIVE and CANCELLED", () => {
    assert.equal(
      canTransitionEnrollmentStatus("PENDING_PAYMENT", "ACTIVE"),
      true
    );
    assert.equal(
      canTransitionEnrollmentStatus("PENDING_PAYMENT", "CANCELLED"),
      true
    );
  });

  test("ACTIVE and PAUSED transitions follow the enrollment workflow", () => {
    assert.equal(canTransitionEnrollmentStatus("ACTIVE", "PAUSED"), true);
    assert.equal(canTransitionEnrollmentStatus("PAUSED", "ACTIVE"), true);
    assert.equal(canTransitionEnrollmentStatus("ACTIVE", "COMPLETED"), true);
    assert.equal(canTransitionEnrollmentStatus("ACTIVE", "CANCELLED"), true);
    assert.equal(canTransitionEnrollmentStatus("PAUSED", "CANCELLED"), true);
  });

  test("invalid enrollment transitions are blocked", () => {
    assert.equal(
      canTransitionEnrollmentStatus("PENDING_PAYMENT", "COMPLETED"),
      false
    );
    assert.throws(
      () => assertEnrollmentStatusTransition("PENDING_PAYMENT", "COMPLETED"),
      EnrollmentStatusTransitionError
    );
  });
});

describe("recommended plan acceptance guard", () => {
  test("allows a parent to accept their own active recommendation", () => {
    const result = validateRecommendedPlanAcceptance(validAcceptance);

    assert.equal(result.success, true);
  });

  test("blocks another parent's assessment", () => {
    const result = validateRecommendedPlanAcceptance({
      ...validAcceptance,
      currentUserId: "other-parent-user-id"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.assessmentRequestId, "Assessment request not found.");
  });

  test("blocks inactive recommended plan acceptance", () => {
    const result = validateRecommendedPlanAcceptance({
      ...validAcceptance,
      recommendedPlanIsActive: false
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.recommendedPlanId, "Recommended plan is not active.");
  });

  test("prevents duplicate enrollment acceptance", () => {
    const result = validateRecommendedPlanAcceptance({
      ...validAcceptance,
      existingEnrollmentId: "existing-enrollment-id"
    });

    assert.equal(result.success, false);
    assert.equal(
      result.fieldErrors?.assessmentRequestId,
      "This recommendation has already been accepted."
    );
  });

  test("new accepted enrollment starts as PENDING_PAYMENT", () => {
    const enrollmentData = getPendingEnrollmentData({
      parentId: "parent-profile-id",
      studentId: "student-id",
      recommendedPlanId: "plan-id",
      assessmentRequestId: "assessment-id"
    });

    assert.equal(enrollmentData.status, "PENDING_PAYMENT");
    assert.equal(enrollmentData.parentId, "parent-profile-id");
    assert.equal(enrollmentData.tutoringPlanId, "plan-id");
  });

  test("assessment becomes CONVERTED after plan acceptance", () => {
    assert.equal(getAcceptedAssessmentStatus(), "CONVERTED");
  });

  test("plan accepted notifications are linked to the next workflow area", () => {
    const parentPayload =
      getParentPlanAcceptedNotificationPayload("enrollment-id");
    const adminPayload = getAdminPlanAcceptedNotificationPayload({
      parentName: "Ada Parent",
      childName: "Timi Parent",
      planName: "Growth Plan"
    });

    assert.equal(parentPayload.type, "PLAN_ACCEPTED");
    assert.match(parentPayload.href, /enrollment-id/);
    assert.equal(adminPayload.type, "PLAN_ACCEPTED");
    assert.match(adminPayload.message, /Growth Plan/);
  });
});
