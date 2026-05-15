import type { ProgressStatus, ReportStatus } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type ParentReportProgressMeta = {
  label: string;
  tone: StatusTone;
};

const PROGRESS_STATUS_META: Record<ProgressStatus, ParentReportProgressMeta> = {
  NEEDS_ATTENTION: {
    label: "Needs Extra Support",
    tone: "warning"
  },
  IMPROVING: {
    label: "Improving",
    tone: "info"
  },
  ON_TRACK: {
    label: "On Track",
    tone: "success"
  },
  EXCELLENT: {
    label: "Excellent",
    tone: "success"
  }
};

export function getParentReportProgressMeta(
  status: ProgressStatus
): ParentReportProgressMeta {
  return PROGRESS_STATUS_META[status];
}

export type ParentReportListSource = {
  id: string;
  reportingMonth: Date;
  subjectsCovered: string;
  attendanceSummary: string;
  strengths: string;
  areasNeedingImprovement: string;
  homeworkCompletion: string;
  tutorComments: string;
  recommendedNextSteps: string;
  parentActionPoints: string;
  overallProgressStatus: ProgressStatus;
  status: ReportStatus;
  publishedAt: Date | null;
  childName: string | null;
  classYearGroup: string | null;
  tutorName: string | null;
  planName: string | null;
};

export function buildParentReportListItem(report: ParentReportListSource) {
  return {
    id: report.id,
    childName: report.childName ?? "Child",
    classYearGroup: report.classYearGroup ?? "Class/year not set",
    tutorName: report.tutorName ?? "TopMox Tutor",
    planName: report.planName ?? "TopMox tutoring plan",
    reportingMonth: report.reportingMonth,
    publishedAt: report.publishedAt,
    progress: getParentReportProgressMeta(report.overallProgressStatus),
    primaryHref: `/parent/reports/${report.id}`,
    actionLabel: "View Report"
  };
}

export function getParentReportDetailActions() {
  return {
    canPrint: true,
    printLabel: "Print Report",
    canDownloadPdf: false,
    downloadPdfLabel: "Download PDF, coming later"
  };
}

export function getLatestParentReportSummary(
  reports: ParentReportListSource[]
) {
  const latestReport = [...reports]
    .filter((report) => report.status === "PUBLISHED")
    .sort((left, right) => {
      const leftTime =
        left.publishedAt?.getTime() ?? left.reportingMonth.getTime();
      const rightTime =
        right.publishedAt?.getTime() ?? right.reportingMonth.getTime();

      return rightTime - leftTime;
    })[0];

  return latestReport ? buildParentReportListItem(latestReport) : null;
}

export function getParentReportDashboardSummary(
  reports: ParentReportListSource[]
) {
  return {
    latestReport: getLatestParentReportSummary(reports),
    publishedReportCount: reports.filter((report) => report.status === "PUBLISHED")
      .length
  };
}
