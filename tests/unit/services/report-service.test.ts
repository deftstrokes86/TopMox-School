import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ReportAccessError,
  ReportStatusTransitionError,
  assertReportStatusTransition,
  assertTutorCanReportOnStudent,
  canTransitionReportStatus,
  getReportPublishedNotificationPayload,
  shapeParentFacingReport
} from "@/server/services/report.service";

describe("progress report status transitions", () => {
  test("DRAFT to REVIEW is allowed", () => {
    assert.equal(canTransitionReportStatus("DRAFT", "REVIEW"), true);
  });

  test("REVIEW to PUBLISHED is allowed", () => {
    assert.equal(canTransitionReportStatus("REVIEW", "PUBLISHED"), true);
  });

  test("REVIEW to DRAFT is allowed", () => {
    assert.equal(canTransitionReportStatus("REVIEW", "DRAFT"), true);
  });

  test("PUBLISHED to DRAFT is blocked", () => {
    assert.equal(canTransitionReportStatus("PUBLISHED", "DRAFT"), false);
    assert.throws(
      () => assertReportStatusTransition("PUBLISHED", "DRAFT"),
      ReportStatusTransitionError
    );
  });
});

describe("progress report tutor access", () => {
  test("tutor can draft report for assigned student through active enrollment", () => {
    assert.doesNotThrow(() =>
      assertTutorCanReportOnStudent({
        tutorExists: true,
        hasActiveAssignedEnrollment: true,
        hasAssignedLesson: false
      })
    );
  });

  test("tutor can draft report for assigned student through lesson history", () => {
    assert.doesNotThrow(() =>
      assertTutorCanReportOnStudent({
        tutorExists: true,
        hasActiveAssignedEnrollment: false,
        hasAssignedLesson: true
      })
    );
  });

  test("tutor cannot draft report for unassigned student", () => {
    assert.throws(
      () =>
        assertTutorCanReportOnStudent({
          tutorExists: true,
          hasActiveAssignedEnrollment: false,
          hasAssignedLesson: false
        }),
      ReportAccessError
    );
  });

  test("report requires an authenticated tutor profile", () => {
    assert.throws(
      () =>
        assertTutorCanReportOnStudent({
          tutorExists: false,
          hasActiveAssignedEnrollment: true,
          hasAssignedLesson: true
        }),
      ReportAccessError
    );
  });
});

describe("parent-facing progress report shaping", () => {
  test("parent report view includes published academic fields", () => {
    const shaped = shapeParentFacingReport({
      id: "report-id",
      reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
      subjectsCovered: "Mathematics",
      attendanceSummary: "Attended all scheduled lessons.",
      strengths: "More confident with fractions.",
      areasNeedingImprovement: "Needs more word problem practice.",
      homeworkCompletion: "Completed most homework.",
      tutorComments: "Student is building momentum.",
      recommendedNextSteps: "Continue targeted practice.",
      parentActionPoints: "Encourage short revision sessions.",
      overallProgressStatus: "IMPROVING",
      status: "PUBLISHED",
      publishedAt: new Date("2026-05-31T12:00:00.000Z"),
      internalAdminNotes: "Do not expose this operational note."
    });

    assert.equal(shaped.id, "report-id");
    assert.equal(shaped.status, "PUBLISHED");
    assert.equal("internalAdminNotes" in shaped, false);
  });

  test("report published notification points parent to report detail", () => {
    const payload = getReportPublishedNotificationPayload("report-id");

    assert.equal(payload.type, "REPORT_PUBLISHED");
    assert.match(payload.href ?? "", /parent\/reports\/report-id/);
  });
});
