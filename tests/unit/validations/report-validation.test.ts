import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createProgressReportSchema,
  updateProgressReportSchema,
  updateReportStatusSchema
} from "@/lib/validations/report.schema";

const validReportInput = {
  studentId: "student-id",
  enrollmentId: "enrollment-id",
  reportingMonth: "2026-05-01",
  subjectsCovered: "Mathematics, English",
  attendanceSummary: "Attended 7 of 8 lessons this month.",
  strengths: "Shows better confidence with fractions.",
  areasNeedingImprovement: "Needs more independent problem solving.",
  homeworkCompletion: "Completed most assigned practice tasks.",
  tutorComments: "Student is responding well to guided examples.",
  recommendedNextSteps: "Continue weekly practice on word problems.",
  parentActionPoints: "Encourage 15 minutes of revision three times weekly.",
  overallProgressStatus: "IMPROVING"
};

describe("progress report validation", () => {
  test("report requires student", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      studentId: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires reporting month", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      reportingMonth: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires strengths", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      strengths: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires areas needing improvement", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      areasNeedingImprovement: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires tutor comments", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      tutorComments: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires recommended next steps", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      recommendedNextSteps: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires parent action points", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      parentActionPoints: ""
    });

    assert.equal(result.success, false);
  });

  test("report requires overall progress status", () => {
    const result = createProgressReportSchema.safeParse({
      ...validReportInput,
      overallProgressStatus: ""
    });

    assert.equal(result.success, false);
  });

  test("update report requires report id and editable report fields", () => {
    const result = updateProgressReportSchema.safeParse({
      ...validReportInput,
      reportId: ""
    });

    assert.equal(result.success, false);
  });

  test("status update accepts only valid report statuses", () => {
    const invalid = updateReportStatusSchema.safeParse({
      reportId: "report-id",
      status: "ARCHIVED"
    });
    const valid = updateReportStatusSchema.safeParse({
      reportId: "report-id",
      status: "REVIEW"
    });

    assert.equal(invalid.success, false);
    assert.equal(valid.success, true);
  });
});
