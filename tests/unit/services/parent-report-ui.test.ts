import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildParentReportListItem,
  getParentReportDetailActions,
  getLatestParentReportSummary,
  getParentReportDashboardSummary,
  getParentReportProgressMeta
} from "@/lib/utils/parent-report-ui";
import { buildParentReportWhereInput } from "@/server/queries/report.queries";
import { shapeParentFacingReport } from "@/server/services/report.service";

const publishedReport = shapeParentFacingReport({
  id: "published-report",
  reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
  subjectsCovered: "Mathematics, English",
  attendanceSummary: "Attended 7 of 8 scheduled lessons.",
  strengths: "More confident solving multi-step questions.",
  areasNeedingImprovement: "Needs continued practice with word problems.",
  homeworkCompletion: "Completed most homework with improved consistency.",
  tutorComments: "Amara is building a steadier study rhythm.",
  recommendedNextSteps: "Continue guided practice twice weekly.",
  parentActionPoints: "Encourage 15-minute revision sessions after lessons.",
  overallProgressStatus: "IMPROVING",
  status: "PUBLISHED",
  publishedAt: new Date("2026-05-31T12:00:00.000Z"),
  student: {
    fullName: "Amara Okafor",
    classYearGroup: "Primary 5"
  },
  tutor: {
    user: {
      name: "Mrs Ade"
    }
  },
  enrollment: {
    tutoringPlan: {
      name: "Growth Plan"
    }
  },
  internalAdminNotes: "Parent should never see this operational note."
});

describe("parent progress report visibility", () => {
  test("parent reports page lists only published reports for own children", () => {
    assert.deepEqual(buildParentReportWhereInput("parent-user-id"), {
      parent: {
        userId: "parent-user-id"
      },
      status: "PUBLISHED"
    });
  });

  test("parent cannot see draft or review reports through scoped report filter", () => {
    const where = buildParentReportWhereInput("parent-user-id", "report-id");

    assert.equal(where.status, "PUBLISHED");
    assert.notDeepEqual(where, {
      id: "report-id",
      parent: {
        userId: "parent-user-id"
      },
      status: "DRAFT"
    });
    assert.notDeepEqual(where, {
      id: "report-id",
      parent: {
        userId: "parent-user-id"
      },
      status: "REVIEW"
    });
  });

  test("parent cannot see another parent's report", () => {
    const where = buildParentReportWhereInput("current-parent-user", "report-id");

    assert.deepEqual(where, {
      id: "report-id",
      parent: {
        userId: "current-parent-user"
      },
      status: "PUBLISHED"
    });
    assert.notDeepEqual(where, {
      id: "report-id",
      parent: {
        userId: "other-parent-user"
      },
      status: "PUBLISHED"
    });
  });

  test("parent report detail excludes internal admin-only fields", () => {
    assert.equal("internalAdminNotes" in publishedReport, false);

    const item = buildParentReportListItem(publishedReport);

    assert.equal("internalAdminNotes" in item, false);
  });
});

describe("parent progress report UI helpers", () => {
  test("report card links to parent report detail with parent-facing context", () => {
    const item = buildParentReportListItem(publishedReport);

    assert.equal(item.id, "published-report");
    assert.equal(item.childName, "Amara Okafor");
    assert.equal(item.tutorName, "Mrs Ade");
    assert.equal(item.reportingMonth, publishedReport.reportingMonth);
    assert.equal(item.primaryHref, "/parent/reports/published-report");
    assert.equal(item.actionLabel, "View Report");
  });

  test("progress metadata uses reassuring parent-facing labels", () => {
    assert.deepEqual(getParentReportProgressMeta("IMPROVING"), {
      label: "Improving",
      tone: "info"
    });

    assert.deepEqual(getParentReportProgressMeta("NEEDS_ATTENTION"), {
      label: "Needs Extra Support",
      tone: "warning"
    });
  });

  test("report detail keeps print enabled and PDF clearly deferred", () => {
    assert.deepEqual(getParentReportDetailActions(), {
      canPrint: true,
      printLabel: "Print Report",
      canDownloadPdf: false,
      downloadPdfLabel: "Download PDF, coming later"
    });
  });

  test("parent dashboard shows the latest published report", () => {
    const olderReport = {
      ...publishedReport,
      id: "older-report",
      reportingMonth: new Date("2026-04-01T00:00:00.000Z"),
      publishedAt: new Date("2026-04-30T12:00:00.000Z")
    };
    const latestReport = {
      ...publishedReport,
      id: "latest-report",
      reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
      publishedAt: new Date("2026-05-31T12:00:00.000Z")
    };

    assert.equal(
      getLatestParentReportSummary([olderReport, latestReport])?.id,
      "latest-report"
    );

    const summary = getParentReportDashboardSummary([
      olderReport,
      latestReport
    ]);

    assert.equal(summary.publishedReportCount, 2);
    assert.equal(summary.latestReport?.id, "latest-report");
  });
});
