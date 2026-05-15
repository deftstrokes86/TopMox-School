import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildTutorReportListItem,
  getTutorReportActions,
  getTutorReportDashboardSummary,
  getTutorReportStatusMeta
} from "@/lib/utils/tutor-report-ui";
import { createProgressReportSchema } from "@/lib/validations/report.schema";
import { buildTutorReportWhereInput } from "@/server/queries/report.queries";

const baseReport = {
  id: "report-id",
  reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
  status: "DRAFT" as const,
  createdAt: new Date("2026-05-20T12:00:00.000Z"),
  overallProgressStatus: "IMPROVING" as const,
  student: {
    fullName: "Amara Okafor",
    classYearGroup: "Primary 5"
  },
  enrollment: {
    tutoringPlan: {
      name: "Growth Plan",
      sessionsPerWeek: 3
    }
  }
};

describe("tutor progress report UI visibility", () => {
  test("tutor reports page lists only the current tutor's reports", () => {
    assert.deepEqual(buildTutorReportWhereInput("tutor-user-id"), {
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });

  test("tutor can open their own draft report through scoped detail filter", () => {
    assert.deepEqual(buildTutorReportWhereInput("tutor-user-id", "report-id"), {
      id: "report-id",
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });

  test("tutor report detail filter cannot match another tutor's report", () => {
    const where = buildTutorReportWhereInput("current-tutor-user", "report-id");

    assert.notDeepEqual(where, {
      id: "report-id",
      tutor: {
        userId: "other-tutor-user"
      }
    });
  });
});

describe("tutor progress report form validation", () => {
  test("new report form requires required fields", () => {
    const result = createProgressReportSchema.safeParse({
      studentId: "student-id"
    });

    assert.equal(result.success, false);
  });
});

describe("tutor progress report actions", () => {
  test("submit for review only appears for draft reports", () => {
    assert.deepEqual(getTutorReportActions({ status: "DRAFT" }), {
      canEdit: true,
      canSubmitForReview: true,
      isReadOnly: false
    });

    assert.equal(
      getTutorReportActions({ status: "REVIEW" }).canSubmitForReview,
      false
    );
    assert.equal(
      getTutorReportActions({ status: "PUBLISHED" }).canSubmitForReview,
      false
    );
  });

  test("published reports are read-only for tutor", () => {
    assert.deepEqual(getTutorReportActions({ status: "PUBLISHED" }), {
      canEdit: false,
      canSubmitForReview: false,
      isReadOnly: true
    });
  });

  test("report status metadata uses tutor-facing labels", () => {
    assert.deepEqual(getTutorReportStatusMeta("REVIEW"), {
      label: "In Review",
      tone: "info"
    });
  });

  test("report list item points drafts to editable tutor routes", () => {
    const item = buildTutorReportListItem(baseReport);

    assert.equal(item.studentName, "Amara Okafor");
    assert.equal(item.primaryHref, "/tutor/reports/report-id");
    assert.equal(item.editHref, "/tutor/reports/report-id/edit");
    assert.equal(item.actionLabel, "View/Edit");
  });

  test("dashboard summary counts drafts, reviews, published reports, and reports due", () => {
    const summary = getTutorReportDashboardSummary(
      [
        baseReport,
        {
          ...baseReport,
          id: "review-report",
          status: "REVIEW" as const
        },
        {
          ...baseReport,
          id: "published-report",
          status: "PUBLISHED" as const
        }
      ],
      [
        {
          id: "enrollment-id",
          student: {
            id: "student-id",
            fullName: "Amara Okafor"
          }
        }
      ]
    );

    assert.equal(summary.draftReports, 1);
    assert.equal(summary.reportsInReview, 1);
    assert.equal(summary.publishedReports, 1);
    assert.equal(summary.studentsNeedingReport, 1);
  });
});
