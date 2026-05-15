import type { ProgressStatus, ReportStatus, Role } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type AdminReportStatusMeta = {
  label: string;
  tone: StatusTone;
};

export type AdminReportActions = {
  canPublish: boolean;
  canReturnToDraft: boolean;
  canViewParentPreview: boolean;
};

const REPORT_STATUS_META: Record<ReportStatus, AdminReportStatusMeta> = {
  DRAFT: {
    label: "Draft",
    tone: "warning"
  },
  REVIEW: {
    label: "In Review",
    tone: "info"
  },
  PUBLISHED: {
    label: "Published",
    tone: "success"
  }
};

const PROGRESS_STATUS_META: Record<ProgressStatus, AdminReportStatusMeta> = {
  NEEDS_ATTENTION: {
    label: "Needs Attention",
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

export function getAdminReportStatusMeta(
  status: ReportStatus
): AdminReportStatusMeta {
  return REPORT_STATUS_META[status];
}

export function getAdminReportProgressMeta(
  status: ProgressStatus
): AdminReportStatusMeta {
  return PROGRESS_STATUS_META[status];
}

export function getAdminReportActions({
  status,
  role
}: {
  status: ReportStatus;
  role: Role;
}): AdminReportActions {
  const canReview = role === "ADMIN" && status === "REVIEW";

  return {
    canPublish: canReview,
    canReturnToDraft: canReview,
    canViewParentPreview: role === "ADMIN"
  };
}

export type AdminReportListSource = {
  id: string;
  reportingMonth: Date;
  status: ReportStatus;
  createdAt: Date;
  publishedAt: Date | null;
  overallProgressStatus: ProgressStatus;
  parent: {
    user: {
      name: string;
      email: string;
    };
  };
  student: {
    fullName: string;
    classYearGroup?: string | null;
  };
  tutor: {
    user: {
      name: string;
      email: string;
    };
  };
};

export function buildAdminReportListItem(report: AdminReportListSource) {
  const status = getAdminReportStatusMeta(report.status);
  const progress = getAdminReportProgressMeta(report.overallProgressStatus);

  return {
    id: report.id,
    studentName: report.student.fullName,
    classYearGroup: report.student.classYearGroup ?? "Class/year not set",
    parentName: report.parent.user.name,
    parentEmail: report.parent.user.email,
    tutorName: report.tutor.user.name,
    tutorEmail: report.tutor.user.email,
    reportingMonth: report.reportingMonth,
    createdAt: report.createdAt,
    publishedAt: report.publishedAt,
    status,
    progress,
    primaryHref: `/admin/reports/${report.id}`,
    actionLabel: "Review"
  };
}

function getCurrentMonthRange(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { start, end };
}

export function getAdminReportDashboardSummary(
  reports: Array<
    {
      status: ReportStatus;
      publishedAt: Date | null;
    } & Record<string, unknown>
  >,
  reportsDue: Array<unknown>,
  now = new Date()
) {
  const { start, end } = getCurrentMonthRange(now);

  return {
    draftReports: reports.filter((report) => report.status === "DRAFT").length,
    reportsInReview: reports.filter((report) => report.status === "REVIEW")
      .length,
    publishedReports: reports.filter((report) => report.status === "PUBLISHED")
      .length,
    publishedThisMonth: reports.filter(
      (report) =>
        report.publishedAt &&
        report.publishedAt >= start &&
        report.publishedAt < end
    ).length,
    reportsDue: reportsDue.length
  };
}
