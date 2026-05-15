import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminReportListItem,
  getAdminReportActions,
  getAdminReportDashboardSummary,
  getAdminReportStatusMeta
} from "@/lib/utils/admin-report-ui";
import { buildAdminReportWhereInput } from "@/server/queries/report.queries";
import { publishProgressReport } from "@/server/services/report.service";

const reviewReport = {
  id: "report-id",
  reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
  status: "REVIEW" as const,
  createdAt: new Date("2026-05-20T12:00:00.000Z"),
  publishedAt: null,
  overallProgressStatus: "IMPROVING" as const,
  parent: {
    user: {
      name: "Parent User",
      email: "parent@example.com"
    }
  },
  student: {
    fullName: "Amara Okafor",
    classYearGroup: "Primary 5"
  },
  tutor: {
    user: {
      name: "Tutor User",
      email: "tutor@example.com"
    }
  }
};

describe("admin progress report list visibility", () => {
  test("admin reports page lists all reports by default", () => {
    assert.deepEqual(buildAdminReportWhereInput(), {});
  });

  test("admin report list item contains review route and operational context", () => {
    const item = buildAdminReportListItem(reviewReport);

    assert.equal(item.studentName, "Amara Okafor");
    assert.equal(item.parentName, "Parent User");
    assert.equal(item.tutorName, "Tutor User");
    assert.equal(item.primaryHref, "/admin/reports/report-id");
    assert.equal(item.actionLabel, "Review");
  });

  test("admin can view report in REVIEW status", () => {
    assert.deepEqual(getAdminReportStatusMeta("REVIEW"), {
      label: "In Review",
      tone: "info"
    });
  });
});

describe("admin progress report review actions", () => {
  test("admin can publish REVIEW report", () => {
    const actions = getAdminReportActions({
      status: "REVIEW",
      role: "ADMIN"
    });

    assert.equal(actions.canPublish, true);
  });

  test("admin can return REVIEW report to DRAFT", () => {
    const actions = getAdminReportActions({
      status: "REVIEW",
      role: "ADMIN"
    });

    assert.equal(actions.canReturnToDraft, true);
  });

  test("non-admin cannot publish report", () => {
    const actions = getAdminReportActions({
      status: "REVIEW",
      role: "TUTOR"
    });

    assert.equal(actions.canPublish, false);
    assert.equal(actions.canReturnToDraft, false);
  });
});

describe("admin progress report publishing", () => {
  test("publishing creates parent notification and publishedAt timestamp", async () => {
    const publishedAt = new Date("2026-05-31T12:00:00.000Z");
    const notificationCalls: unknown[] = [];
    const updateCalls: unknown[] = [];

    const client = {
      progressReport: {
        update: async (input: unknown) => {
          updateCalls.push(input);
          return {
            id: "report-id",
            status: "PUBLISHED" as const,
            publishedAt
          };
        }
      },
      notification: {
        create: async (input: unknown) => {
          notificationCalls.push(input);
          return { id: "notification-id" };
        }
      }
    };

    const report = await publishProgressReport(client, {
      reportId: "report-id",
      parentUserId: "parent-user-id",
      publishedAt
    });

    assert.equal(report.status, "PUBLISHED");
    assert.equal(report.publishedAt, publishedAt);
    assert.equal(updateCalls.length, 1);
    assert.equal(notificationCalls.length, 1);
    assert.deepEqual(notificationCalls[0], {
      data: {
        userId: "parent-user-id",
        type: "REPORT_PUBLISHED",
        title: "Your child's progress report is ready.",
        message:
          "TopMox has published a progress report for your child. Review the latest learning update in your parent dashboard.",
        href: "/parent/reports/report-id"
      }
    });
  });

  test("dashboard summary tracks draft, review, published, published this month, and reports due", () => {
    const summary = getAdminReportDashboardSummary(
      [
        {
          ...reviewReport,
          id: "draft-report",
          status: "DRAFT" as const
        },
        reviewReport,
        {
          ...reviewReport,
          id: "published-report",
          status: "PUBLISHED" as const,
          publishedAt: new Date("2026-05-15T12:00:00.000Z")
        }
      ],
      [{ id: "enrollment-due" }],
      new Date("2026-05-20T09:00:00.000Z")
    );

    assert.equal(summary.draftReports, 1);
    assert.equal(summary.reportsInReview, 1);
    assert.equal(summary.publishedReports, 1);
    assert.equal(summary.publishedThisMonth, 1);
    assert.equal(summary.reportsDue, 1);
  });
});
