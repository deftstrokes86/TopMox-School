import type { ProgressStatus, ReportStatus } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type TutorReportStatusMeta = {
  label: string;
  tone: StatusTone;
};

export type TutorReportActions = {
  canEdit: boolean;
  canSubmitForReview: boolean;
  isReadOnly: boolean;
};

const REPORT_STATUS_META: Record<ReportStatus, TutorReportStatusMeta> = {
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

const PROGRESS_STATUS_META: Record<ProgressStatus, TutorReportStatusMeta> = {
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

export function getTutorReportStatusMeta(
  status: ReportStatus
): TutorReportStatusMeta {
  return REPORT_STATUS_META[status];
}

export function getTutorProgressStatusMeta(
  status: ProgressStatus
): TutorReportStatusMeta {
  return PROGRESS_STATUS_META[status];
}

export function getTutorReportActions({
  status,
  isOwner = true
}: {
  status: ReportStatus;
  isOwner?: boolean;
}): TutorReportActions {
  const canEdit = isOwner && status === "DRAFT";

  return {
    canEdit,
    canSubmitForReview: canEdit,
    isReadOnly: !canEdit
  };
}

export type TutorReportListSource = {
  id: string;
  reportingMonth: Date;
  status: ReportStatus;
  createdAt: Date;
  overallProgressStatus: ProgressStatus;
  student: {
    fullName: string;
    classYearGroup?: string | null;
  };
  enrollment?: {
    tutoringPlan: {
      name: string;
      sessionsPerWeek: number;
    };
  } | null;
};

export function buildTutorReportListItem(report: TutorReportListSource) {
  const actions = getTutorReportActions({ status: report.status });
  const status = getTutorReportStatusMeta(report.status);
  const progress = getTutorProgressStatusMeta(report.overallProgressStatus);

  return {
    id: report.id,
    studentName: report.student.fullName,
    classYearGroup: report.student.classYearGroup ?? "Class/year not set",
    reportingMonth: report.reportingMonth,
    createdAt: report.createdAt,
    planName: report.enrollment?.tutoringPlan.name ?? "No linked plan",
    sessionsPerWeek: report.enrollment?.tutoringPlan.sessionsPerWeek ?? null,
    status,
    progress,
    primaryHref: `/tutor/reports/${report.id}`,
    editHref: actions.canEdit ? `/tutor/reports/${report.id}/edit` : null,
    actionLabel: actions.canEdit ? "View/Edit" : "View",
    ...actions
  };
}

export function getTutorReportDashboardSummary(
  reports: Array<{ status: ReportStatus } & Record<string, unknown>>,
  reportsDue: Array<unknown>
) {
  return {
    draftReports: reports.filter((report) => report.status === "DRAFT").length,
    reportsInReview: reports.filter((report) => report.status === "REVIEW")
      .length,
    publishedReports: reports.filter((report) => report.status === "PUBLISHED")
      .length,
    studentsNeedingReport: reportsDue.length
  };
}
