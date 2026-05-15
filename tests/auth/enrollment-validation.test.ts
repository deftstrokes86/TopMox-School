import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { acceptRecommendedPlanSchema } from "@/lib/validations/enrollment.schema";

const assessmentRequestId = "ckq9v7z7z0002x7p52u2v7h1n";
const recommendedPlanId = "ckq9v7z7z0003x7p52u2v7h1p";

describe("enrollment validation schemas", () => {
  test("acceptRecommendedPlanSchema requires assessmentRequestId", () => {
    const result = acceptRecommendedPlanSchema.safeParse({
      assessmentRequestId: undefined,
      recommendedPlanId
    });

    assert.equal(result.success, false);
  });

  test("acceptRecommendedPlanSchema requires recommendedPlanId", () => {
    const result = acceptRecommendedPlanSchema.safeParse({
      assessmentRequestId,
      recommendedPlanId: undefined
    });

    assert.equal(result.success, false);
  });

  test("acceptRecommendedPlanSchema accepts valid ids", () => {
    const result = acceptRecommendedPlanSchema.safeParse({
      assessmentRequestId,
      recommendedPlanId
    });

    assert.equal(result.success, true);
  });
});
