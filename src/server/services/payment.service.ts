import type { EnrollmentStatus, PaymentStatus, Prisma } from "@prisma/client";

import type {
  CreateManualPaymentInput,
  ReviewPaymentInput
} from "@/lib/validations/payment.schema";

export class PaymentStatusTransitionError extends Error {
  constructor(currentStatus: PaymentStatus, nextStatus: PaymentStatus) {
    super(`Cannot transition payment from ${currentStatus} to ${nextStatus}.`);
    this.name = "PaymentStatusTransitionError";
  }
}

export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  PENDING: [],
  AWAITING_VERIFICATION: ["PAID", "FAILED"],
  PAID: ["REFUNDED"],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: []
};

export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertPaymentStatusTransition(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus
): void {
  if (!canTransitionPaymentStatus(currentStatus, nextStatus)) {
    throw new PaymentStatusTransitionError(currentStatus, nextStatus);
  }
}

export type ManualPaymentSubmissionInput = {
  currentUserId: string;
  enrollmentParentUserId: string;
  enrollmentStatus: EnrollmentStatus;
  existingVerificationPaymentId?: string | null;
};

export type ManualPaymentSubmissionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof CreateManualPaymentInput, string>>;
    };

export type PaymentReviewInput = {
  currentRole: "ADMIN" | "TUTOR" | "PARENT";
  paymentStatus: PaymentStatus;
  enrollmentStatus: EnrollmentStatus | null;
  decision: ReviewPaymentInput["decision"];
};

export type PaymentReviewResult =
  | {
      success: true;
      nextPaymentStatus: PaymentStatus;
      nextEnrollmentStatus: EnrollmentStatus | null;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof ReviewPaymentInput, string>>;
    };

export function validateManualPaymentSubmission({
  currentUserId,
  enrollmentParentUserId,
  enrollmentStatus,
  existingVerificationPaymentId
}: ManualPaymentSubmissionInput): ManualPaymentSubmissionResult {
  if (currentUserId !== enrollmentParentUserId) {
    return {
      success: false,
      message: "Enrollment not found.",
      fieldErrors: {
        enrollmentId: "Enrollment not found."
      }
    };
  }

  if (enrollmentStatus !== "PENDING_PAYMENT") {
    return {
      success: false,
      message: "Payment can only be submitted for plans awaiting payment.",
      fieldErrors: {
        enrollmentId: "This tutoring plan is not awaiting payment."
      }
    };
  }

  if (existingVerificationPaymentId) {
    return {
      success: false,
      message: "Payment details have already been submitted for this plan.",
      fieldErrors: {
        enrollmentId: "Payment is already under review for this plan."
      }
    };
  }

  return { success: true };
}

export function validatePaymentReview({
  currentRole,
  paymentStatus,
  enrollmentStatus,
  decision
}: PaymentReviewInput): PaymentReviewResult {
  if (currentRole !== "ADMIN") {
    return {
      success: false,
      message: "Only admins can review payments.",
      fieldErrors: {
        paymentId: "Only admins can review payments."
      }
    };
  }

  if (paymentStatus !== "AWAITING_VERIFICATION") {
    return {
      success: false,
      message: "This payment has already been reviewed.",
      fieldErrors: {
        paymentId: "Only payments awaiting verification can be reviewed."
      }
    };
  }

  const nextPaymentStatus = decision === "APPROVE" ? "PAID" : "FAILED";
  assertPaymentStatusTransition(paymentStatus, nextPaymentStatus);

  if (decision === "APPROVE" && enrollmentStatus !== "PENDING_PAYMENT") {
    return {
      success: false,
      message: "The linked enrollment is not awaiting payment.",
      fieldErrors: {
        paymentId: "Linked enrollment is not awaiting payment."
      }
    };
  }

  return {
    success: true,
    nextPaymentStatus,
    nextEnrollmentStatus: decision === "APPROVE" ? "ACTIVE" : enrollmentStatus
  };
}

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getManualPaymentData({
  parentId,
  studentId,
  enrollmentId,
  amount,
  currency,
  paymentMethod,
  reference,
  proofUrl
}: {
  parentId: string;
  studentId: string;
  enrollmentId: string;
  amount: Prisma.Decimal | number | string;
  currency: string;
  paymentMethod: CreateManualPaymentInput["paymentMethod"];
  reference?: string;
  proofUrl?: string;
}) {
  return {
    parentId,
    studentId,
    enrollmentId,
    amount,
    currency,
    paymentMethod,
    reference: normalizeOptionalText(reference),
    proofUrl: normalizeOptionalText(proofUrl),
    status: "AWAITING_VERIFICATION" as const
  };
}

export function getParentPaymentSubmittedNotificationPayload(paymentId: string) {
  return {
    type: "PAYMENT_SUBMITTED" as const,
    title: "Your payment has been submitted for review.",
    message:
      "TopMox has received your payment details and will verify them before activating the tutoring plan.",
    href: `/parent/payments/${paymentId}`
  };
}

export function getAdminPaymentSubmittedNotificationPayload({
  parentName,
  childName,
  planName
}: {
  parentName: string | null;
  childName: string;
  planName: string;
}) {
  return {
    type: "PAYMENT_SUBMITTED" as const,
    title: "Payment submitted for verification.",
    message: `${parentName || "A parent"} submitted payment details for ${childName}'s ${planName}.`,
    href: "/admin/payments"
  };
}

export function getPaymentApprovedNotificationPayload(paymentId: string) {
  return {
    type: "PAYMENT_APPROVED" as const,
    title: "Your payment has been approved.",
    message: "Payment approved. Tutoring plan active.",
    href: `/parent/payments/${paymentId}`
  };
}

export function getEnrollmentActivatedNotificationPayload(enrollmentId: string) {
  return {
    type: "ENROLLMENT_ACTIVATED" as const,
    title: "Your child's tutoring plan is now active.",
    message:
      "Your child's tutoring plan is now active. Lessons will appear after scheduling.",
    href: `/parent/enrollments?enrollmentId=${enrollmentId}`
  };
}

export function getPaymentRejectedNotificationPayload(paymentId: string) {
  return {
    type: "PAYMENT_REJECTED" as const,
    title: "Your payment could not be verified.",
    message:
      "Payment could not be verified. Please review the admin note or contact TopMox.",
    href: `/parent/payments/${paymentId}`
  };
}
