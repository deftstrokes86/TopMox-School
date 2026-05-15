import type { Prisma, ProgressStatus, ReportStatus } from "@prisma/client";

export class ReportStatusTransitionError extends Error {
  constructor(currentStatus: ReportStatus, nextStatus: ReportStatus) {
    super(`Cannot transition report from ${currentStatus} to ${nextStatus}.`);
    this.name = "ReportStatusTransitionError";
  }
}

export class ReportAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportAccessError";
  }
}

export const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  DRAFT: ["REVIEW"],
  REVIEW: ["DRAFT", "PUBLISHED"],
  PUBLISHED: []
};

export function canTransitionReportStatus(
  currentStatus: ReportStatus,
  nextStatus: ReportStatus
): boolean {
  return REPORT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertReportStatusTransition(
  currentStatus: ReportStatus,
  nextStatus: ReportStatus
): void {
  if (!canTransitionReportStatus(currentStatus, nextStatus)) {
    throw new ReportStatusTransitionError(currentStatus, nextStatus);
  }
}

export type TutorReportAccessInput = {
  tutorExists: boolean;
  hasActiveAssignedEnrollment: boolean;
  hasAssignedLesson: boolean;
};

export function assertTutorCanReportOnStudent({
  tutorExists,
  hasActiveAssignedEnrollment,
  hasAssignedLesson
}: TutorReportAccessInput): void {
  if (!tutorExists) {
    throw new ReportAccessError("A tutor profile is required to draft reports.");
  }

  if (!hasActiveAssignedEnrollment && !hasAssignedLesson) {
    throw new ReportAccessError(
      "Tutors can only draft reports for assigned students."
    );
  }
}

export type ParentFacingReportSource = {
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
  student?: {
    fullName: string;
    classYearGroup?: string;
  };
  tutor?: {
    user: {
      name: string;
    };
  };
  enrollment?: {
    tutoringPlan: {
      name: string;
    };
  } | null;
  internalAdminNotes?: unknown;
};

export function shapeParentFacingReport(report: ParentFacingReportSource) {
  return {
    id: report.id,
    reportingMonth: report.reportingMonth,
    subjectsCovered: report.subjectsCovered,
    attendanceSummary: report.attendanceSummary,
    strengths: report.strengths,
    areasNeedingImprovement: report.areasNeedingImprovement,
    homeworkCompletion: report.homeworkCompletion,
    tutorComments: report.tutorComments,
    recommendedNextSteps: report.recommendedNextSteps,
    parentActionPoints: report.parentActionPoints,
    overallProgressStatus: report.overallProgressStatus,
    status: report.status,
    publishedAt: report.publishedAt,
    childName: report.student?.fullName ?? null,
    classYearGroup: report.student?.classYearGroup ?? null,
    tutorName: report.tutor?.user.name ?? null,
    planName: report.enrollment?.tutoringPlan.name ?? null
  };
}

export function getReportPublishedNotificationPayload(reportId: string) {
  return {
    type: "REPORT_PUBLISHED" as const,
    title: "Your child's progress report is ready.",
    message:
      "TopMox has published a progress report for your child. Review the latest learning update in your parent dashboard.",
    href: `/parent/reports/${reportId}`
  };
}

type ReportPublishingClient = Pick<
  Prisma.TransactionClient,
  "progressReport" | "notification"
>;

export async function publishProgressReport(
  client: ReportPublishingClient,
  input: {
    reportId: string;
    parentUserId: string;
    publishedAt?: Date;
  }
) {
  const publishedAt = input.publishedAt ?? new Date();
  const report = await client.progressReport.update({
    where: {
      id: input.reportId
    },
    data: {
      status: "PUBLISHED",
      publishedAt
    },
    select: {
      id: true,
      status: true,
      publishedAt: true
    }
  });

  await client.notification.create({
    data: {
      userId: input.parentUserId,
      ...getReportPublishedNotificationPayload(report.id)
    }
  });

  return report;
}
