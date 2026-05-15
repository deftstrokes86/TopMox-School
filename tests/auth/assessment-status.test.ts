import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  AssessmentStatusTransitionError,
  assertAssessmentStatusTransition,
  canRecordAssessmentOutcome,
  canTransitionAssessmentStatus,
  getPlanRecommendedNotificationPayload,
  shouldPublishAssessmentRecommendation
} from "@/server/services/assessment.service";

describe("assessment status transitions", () => {
  test("PENDING_REVIEW can transition to SCHEDULED", () => {
    assert.equal(
      canTransitionAssessmentStatus("PENDING_REVIEW", "SCHEDULED"),
      true
    );
  });

  test("PENDING_REVIEW can transition to DECLINED", () => {
    assert.equal(
      canTransitionAssessmentStatus("PENDING_REVIEW", "DECLINED"),
      true
    );
  });

  test("SCHEDULED can transition to COMPLETED", () => {
    assert.equal(canTransitionAssessmentStatus("SCHEDULED", "COMPLETED"), true);
  });

  test("SCHEDULED can transition to DECLINED for admin cancellation", () => {
    assert.equal(canTransitionAssessmentStatus("SCHEDULED", "DECLINED"), true);
  });

  test("COMPLETED can transition to PLAN_RECOMMENDED", () => {
    assert.equal(
      canTransitionAssessmentStatus("COMPLETED", "PLAN_RECOMMENDED"),
      true
    );
  });

  test("PLAN_RECOMMENDED can transition to CONVERTED", () => {
    assert.equal(
      canTransitionAssessmentStatus("PLAN_RECOMMENDED", "CONVERTED"),
      true
    );
  });

  test("invalid transitions are blocked", () => {
    assert.equal(canTransitionAssessmentStatus("PENDING_REVIEW", "COMPLETED"), false);
    assert.throws(
      () => assertAssessmentStatusTransition("PENDING_REVIEW", "COMPLETED"),
      AssessmentStatusTransitionError
    );
  });

  test("outcome recording is allowed for completed and plan-recommended assessments only", () => {
    assert.equal(canRecordAssessmentOutcome("COMPLETED"), true);
    assert.equal(canRecordAssessmentOutcome("PLAN_RECOMMENDED"), true);
    assert.equal(canRecordAssessmentOutcome("SCHEDULED"), false);
    assert.equal(canRecordAssessmentOutcome("PENDING_REVIEW"), false);
  });

  test("recommendation publishing only happens from completed status with a plan", () => {
    assert.equal(
      shouldPublishAssessmentRecommendation({
        currentStatus: "COMPLETED",
        recommendedPlanId: "ckq9v7z7z0003x7p52u2v7h1p"
      }),
      true
    );
    assert.equal(
      shouldPublishAssessmentRecommendation({
        currentStatus: "COMPLETED",
        recommendedPlanId: null
      }),
      false
    );
    assert.equal(
      shouldPublishAssessmentRecommendation({
        currentStatus: "PLAN_RECOMMENDED",
        recommendedPlanId: "ckq9v7z7z0003x7p52u2v7h1p"
      }),
      false
    );
  });

  test("plan recommended notification payload points parents to the assessment", () => {
    const payload = getPlanRecommendedNotificationPayload("assessment_123");

    assert.equal(payload.type, "PLAN_RECOMMENDED");
    assert.equal(payload.title, "Learning recommendation ready");
    assert.equal(payload.href, "/parent/assessments/assessment_123");
  });
});
