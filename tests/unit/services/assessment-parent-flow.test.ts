import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import { resolveBookAssessmentReadiness } from "@/lib/utils/assessment-readiness";
import { createAssessmentRequestSchema } from "@/lib/validations/assessment.schema";

describe("parent assessment request helpers", () => {
  test("assessment request validation rejects empty required fields", () => {
    const result = createAssessmentRequestSchema.safeParse({
      studentId: "",
      subjects: [],
      academicConcern: "",
      preferredAssessmentDate: "",
      preferredAssessmentTime: "",
      timezone: "",
      notes: ""
    });

    assert.equal(result.success, false);
  });

  test("parent without child profile is guided to create a child profile", () => {
    const readiness = resolveBookAssessmentReadiness({
      hasParentProfile: true,
      hasChildren: false
    });

    assert.equal(readiness.state, "CHILD_PROFILE_REQUIRED");
    assert.equal(readiness.ctaHref, "/parent/children/new");
  });

  test("parent with profile and child can request assessment", () => {
    const readiness = resolveBookAssessmentReadiness({
      hasParentProfile: true,
      hasChildren: true
    });

    assert.equal(readiness.state, "READY");
    assert.equal(readiness.ctaHref, null);
  });

  test("assessment status metadata returns expected parent labels", () => {
    assert.equal(getAssessmentStatusMeta("PENDING_REVIEW").label, "Pending review");
    assert.equal(getAssessmentStatusMeta("SCHEDULED").label, "Scheduled");
    assert.equal(getAssessmentStatusMeta("PLAN_RECOMMENDED").label, "Plan recommended");
  });
});

