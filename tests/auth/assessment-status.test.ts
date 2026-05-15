import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  AssessmentStatusTransitionError,
  assertAssessmentStatusTransition,
  canTransitionAssessmentStatus
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
});
