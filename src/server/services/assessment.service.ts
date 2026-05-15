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
  SCHEDULED: ["COMPLETED"],
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
