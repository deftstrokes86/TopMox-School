import type { EnrollmentStatus, Prisma } from "@prisma/client";

import type { CreateManualPaymentInput } from "@/lib/validations/payment.schema";

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
