import type { AssessmentStatus } from "@prisma/client";

export class AssessmentStatusTransitionError extends Error {
  constructor(currentStatus: AssessmentStatus, nextStatus: AssessmentStatus) {
    super(`Cannot transition assessment from ${currentStatus} to ${nextStatus}.`);
    this.name = "AssessmentStatusTransitionError";
  }
}

export const ASSESSMENT_STATUS_TRANSITIONS: Record<
  AssessmentStatus,
  AssessmentStatus[]
> = {
  PENDING_REVIEW: ["SCHEDULED", "DECLINED"],
  SCHEDULED: ["COMPLETED", "DECLINED"],
  COMPLETED: ["PLAN_RECOMMENDED"],
  PLAN_RECOMMENDED: ["CONVERTED", "DECLINED"],
  CONVERTED: [],
  DECLINED: []
};

export function canTransitionAssessmentStatus(
  currentStatus: AssessmentStatus,
  nextStatus: AssessmentStatus
): boolean {
  return ASSESSMENT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertAssessmentStatusTransition(
  currentStatus: AssessmentStatus,
  nextStatus: AssessmentStatus
): void {
  if (!canTransitionAssessmentStatus(currentStatus, nextStatus)) {
    throw new AssessmentStatusTransitionError(currentStatus, nextStatus);
  }
}

export function canRecordAssessmentOutcome(status: AssessmentStatus): boolean {
  return status === "COMPLETED" || status === "PLAN_RECOMMENDED";
}

export function shouldPublishAssessmentRecommendation({
  currentStatus,
  recommendedPlanId
}: {
  currentStatus: AssessmentStatus;
  recommendedPlanId: string | null;
}): boolean {
  return currentStatus === "COMPLETED" && Boolean(recommendedPlanId);
}

export function getAdminAssessmentSubmittedNotificationPayload({
  parentName,
  childName
}: {
  parentName: string | null;
  childName: string;
}) {
  return {
    type: "ASSESSMENT_SUBMITTED" as const,
    title: "New assessment request submitted.",
    message: `${parentName || "A parent"} submitted a child assessment request for ${childName}.`,
    href: "/admin/assessments"
  };
}

export function getParentAssessmentSubmittedNotificationPayload() {
  return {
    type: "ASSESSMENT_SUBMITTED" as const,
    title: "Your assessment request has been received.",
    message:
      "TopMox has received your child assessment request. An academic coordinator will review it and follow up with next steps.",
    href: "/parent/assessments"
  };
}

export function getAssessmentStatusNotificationPayload(
  status: AssessmentStatus
) {
  switch (status) {
    case "SCHEDULED":
      return {
        type: "ASSESSMENT_SCHEDULED" as const,
        title: "Your child assessment has been scheduled.",
        message:
          "TopMox has scheduled your child assessment. Please review the details in your parent dashboard.",
        href: "/parent/assessments"
      };
    case "COMPLETED":
      return {
        type: "ASSESSMENT_COMPLETED" as const,
        title: "Your child assessment has been completed.",
        message:
          "TopMox has marked the assessment as completed. The next step is an academic recommendation.",
        href: "/parent/assessments"
      };
    case "DECLINED":
      return {
        type: "ASSESSMENT_DECLINED" as const,
        title: "Your assessment request has been updated.",
        message:
          "TopMox has updated your assessment request status. Please contact support if you need clarification.",
        href: "/parent/assessments"
      };
    default:
      return null;
  }
}

export function getPlanRecommendedNotificationPayload(assessmentId: string) {
  return {
    type: "PLAN_RECOMMENDED" as const,
    title: "Learning recommendation ready",
    message: "TopMox has prepared a recommended learning path for your child.",
    href: `/parent/assessments/${assessmentId}`
  };
}
