import type { AssessmentStatus, EnrollmentStatus } from "@prisma/client";

export class EnrollmentStatusTransitionError extends Error {
  constructor(currentStatus: EnrollmentStatus, nextStatus: EnrollmentStatus) {
    super(`Cannot transition enrollment from ${currentStatus} to ${nextStatus}.`);
    this.name = "EnrollmentStatusTransitionError";
  }
}

export const ENROLLMENT_STATUS_TRANSITIONS: Record<
  EnrollmentStatus,
  EnrollmentStatus[]
> = {
  PENDING_PAYMENT: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["ACTIVE", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

export function canTransitionEnrollmentStatus(
  currentStatus: EnrollmentStatus,
  nextStatus: EnrollmentStatus
): boolean {
  return ENROLLMENT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertEnrollmentStatusTransition(
  currentStatus: EnrollmentStatus,
  nextStatus: EnrollmentStatus
): void {
  if (!canTransitionEnrollmentStatus(currentStatus, nextStatus)) {
    throw new EnrollmentStatusTransitionError(currentStatus, nextStatus);
  }
}

export type RecommendedPlanAcceptanceInput = {
  currentUserId: string;
  assessmentParentUserId: string;
  assessmentStatus: AssessmentStatus;
  outcomeRecommendedPlanId: string | null;
  requestedPlanId: string;
  recommendedPlanIsActive: boolean;
  existingEnrollmentId?: string | null;
};

export type RecommendedPlanAcceptanceResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: {
        assessmentRequestId?: string;
        recommendedPlanId?: string;
      };
    };

export function validateRecommendedPlanAcceptance({
  currentUserId,
  assessmentParentUserId,
  assessmentStatus,
  outcomeRecommendedPlanId,
  requestedPlanId,
  recommendedPlanIsActive,
  existingEnrollmentId
}: RecommendedPlanAcceptanceInput): RecommendedPlanAcceptanceResult {
  if (currentUserId !== assessmentParentUserId) {
    return {
      success: false,
      message: "Assessment request not found.",
      fieldErrors: {
        assessmentRequestId: "Assessment request not found."
      }
    };
  }

  if (assessmentStatus !== "PLAN_RECOMMENDED") {
    return {
      success: false,
      message: "This assessment is not ready for plan acceptance.",
      fieldErrors: {
        assessmentRequestId: "Assessment must have a recommended plan first."
      }
    };
  }

  if (!outcomeRecommendedPlanId || outcomeRecommendedPlanId !== requestedPlanId) {
    return {
      success: false,
      message: "The selected plan does not match the current recommendation.",
      fieldErrors: {
        recommendedPlanId: "Choose the currently recommended plan."
      }
    };
  }

  if (!recommendedPlanIsActive) {
    return {
      success: false,
      message: "Recommended plan not found or inactive.",
      fieldErrors: {
        recommendedPlanId: "Recommended plan is not active."
      }
    };
  }

  if (existingEnrollmentId) {
    return {
      success: false,
      message: "This recommended plan has already been accepted.",
      fieldErrors: {
        assessmentRequestId: "This recommendation has already been accepted."
      }
    };
  }

  return { success: true };
}

export function getPendingEnrollmentData({
  parentId,
  studentId,
  recommendedPlanId,
  assessmentRequestId
}: {
  parentId: string;
  studentId: string;
  recommendedPlanId: string;
  assessmentRequestId: string;
}) {
  return {
    parentId,
    studentId,
    tutoringPlanId: recommendedPlanId,
    status: "PENDING_PAYMENT" as const,
    notes: `Accepted recommended plan from assessment ${assessmentRequestId}. Payment pending.`
  };
}

export function getAcceptedAssessmentStatus() {
  return "CONVERTED" as const;
}

export function getParentPlanAcceptedNotificationPayload(enrollmentId: string) {
  return {
    type: "PLAN_ACCEPTED" as const,
    title: "Recommended plan accepted.",
    message:
      "Your recommended tutoring plan has been accepted. Payment tracking is the next step before lessons begin.",
    href: `/parent/payments?enrollmentId=${enrollmentId}`
  };
}

export function getAdminPlanAcceptedNotificationPayload({
  parentName,
  childName,
  planName
}: {
  parentName: string | null;
  childName: string;
  planName: string;
}) {
  return {
    type: "PLAN_ACCEPTED" as const,
    title: "A parent accepted a recommended plan.",
    message: `${parentName || "A parent"} accepted ${planName} for ${childName}.`,
    href: "/admin/payments"
  };
}
