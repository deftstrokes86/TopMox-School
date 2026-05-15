import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assessmentOutcomeSchema,
  createAssessmentRequestSchema,
  scheduleAssessmentSchema
} from "@/lib/validations/assessment.schema";

const studentId = "ckq9v7z7z0000x7p52u2v7h1l";
const subjectId = "ckq9v7z7z0001x7p52u2v7h1m";
const assessmentRequestId = "ckq9v7z7z0002x7p52u2v7h1n";
const planId = "ckq9v7z7z0003x7p52u2v7h1p";

const validAssessmentRequest = {
  studentId,
  subjectIds: [subjectId],
  academicConcern: "Needs help understanding fractions and word problems.",
  preferredAssessmentDate: "2026-06-01",
  preferredAssessmentTime: "5:00 PM WAT",
  timezone: "Africa/Lagos",
  notes: "Parent prefers weekday follow-up."
};

const validOutcome = {
  assessmentRequestId,
  academicLevelSummary:
    "The student understands basic concepts but needs more structured practice.",
  strengths: "Shows effort and responds well to guided examples.",
  weakAreas: "Needs support with multi-step questions and confidence.",
  recommendedSubjects: ["Mathematics"],
  recommendedPlanId: planId,
  recommendedWeeklyLessonCount: 2,
  parentFacingSummary:
    "A structured weekly plan is recommended to build consistency and close key gaps.",
  internalAdminNotes: "Parent prefers weekday lessons."
};

describe("assessment validation schemas", () => {
  test("assessment request requires student", () => {
    const result = createAssessmentRequestSchema.safeParse({
      ...validAssessmentRequest,
      studentId: undefined
    });

    assert.equal(result.success, false);
  });

  test("assessment request requires at least one subject", () => {
    const result = createAssessmentRequestSchema.safeParse({
      ...validAssessmentRequest,
      subjectIds: [],
      subjects: []
    });

    assert.equal(result.success, false);
  });

  test("assessment request requires academic concern", () => {
    const result = createAssessmentRequestSchema.safeParse({
      ...validAssessmentRequest,
      academicConcern: ""
    });

    assert.equal(result.success, false);
  });

  test("schedule schema rejects invalid meeting link", () => {
    const result = scheduleAssessmentSchema.safeParse({
      assessmentRequestId,
      scheduledAt: "2026-06-01T16:00:00.000Z",
      meetingLink: "not-a-url"
    });

    assert.equal(result.success, false);
  });

  test("schedule schema requires scheduled date and time", () => {
    const result = scheduleAssessmentSchema.safeParse({
      assessmentRequestId,
      scheduledAt: undefined,
      meetingLink: ""
    });

    assert.equal(result.success, false);
  });

  test("schedule schema accepts optional meeting link", () => {
    const result = scheduleAssessmentSchema.safeParse({
      assessmentRequestId,
      scheduledAt: "2026-06-01T16:00:00.000Z",
      meetingLink: ""
    });

    assert.equal(result.success, true);
  });

  test("outcome schema requires academic summary, strengths, weak areas, and parent summary", () => {
    const result = assessmentOutcomeSchema.safeParse({
      ...validOutcome,
      academicLevelSummary: "",
      strengths: "",
      weakAreas: "",
      parentFacingSummary: ""
    });

    assert.equal(result.success, false);
  });

  test("outcome schema requires at least one recommended subject", () => {
    const result = assessmentOutcomeSchema.safeParse({
      ...validOutcome,
      recommendedSubjects: []
    });

    assert.equal(result.success, false);
  });
});
