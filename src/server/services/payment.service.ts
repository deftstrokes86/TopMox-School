import type {
  EnrollmentStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma
} from "@prisma/client";

import type {
  CreateManualPaymentInput,
  ReviewPaymentInput
} from "@/lib/validations/payment.schema";
import { db } from "@/lib/db";
import { createFlutterwavePaymentAdapter } from "@/server/integrations/payments/flutterwave.adapter";
import { createManualPaymentAdapter } from "@/server/integrations/payments/manual.adapter";
import type {
  CreateCheckoutInput,
  PaymentProviderAdapter,
  VerifyPaymentResult,
  WebhookHandleResult
} from "@/server/integrations/payments/payment-provider";
import { assertEnrollmentStatusTransition } from "./enrollment.service";

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
  PENDING: ["PAID", "FAILED", "CANCELLED"],
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

export class PaymentSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentSafetyError";
  }
}

export function getPaymentProviderAdapter(
  provider: PaymentProvider | string
): PaymentProviderAdapter {
  if (provider === "FLUTTERWAVE") {
    return createFlutterwavePaymentAdapter();
  }

  if (provider === "MANUAL") {
    return createManualPaymentAdapter();
  }

  throw new PaymentSafetyError(`Unsupported payment provider: ${provider}`);
}

function normalizeMoney(value: Prisma.Decimal | number | string): string {
  const numericValue = Number(value.toString());

  if (!Number.isFinite(numericValue)) {
    throw new PaymentSafetyError("Payment amount is invalid.");
  }

  return numericValue.toFixed(2);
}

function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}

export function assertPaymentAmountAndCurrencyMatch({
  expectedAmount,
  expectedCurrency,
  actualAmount,
  actualCurrency
}: {
  expectedAmount: Prisma.Decimal | number | string;
  expectedCurrency: string;
  actualAmount: Prisma.Decimal | number | string;
  actualCurrency: string;
}): void {
  if (normalizeMoney(expectedAmount) !== normalizeMoney(actualAmount)) {
    throw new PaymentSafetyError("Payment amount mismatch.");
  }

  if (normalizeCurrency(expectedCurrency) !== normalizeCurrency(actualCurrency)) {
    throw new PaymentSafetyError("Payment currency mismatch.");
  }
}

export type GatewayActivationInput = {
  provider: PaymentProvider | string;
  paymentStatus: PaymentStatus;
  enrollmentStatus: EnrollmentStatus;
  verificationStatus: VerifyPaymentResult["status"];
  expectedAmount: Prisma.Decimal | number | string;
  expectedCurrency: string;
  actualAmount: Prisma.Decimal | number | string;
  actualCurrency: string;
};

export type GatewayActivationResult = {
  success: boolean;
  reason?: string;
  nextPaymentStatus: PaymentStatus;
  nextEnrollmentStatus: EnrollmentStatus;
};

export function validateVerifiedGatewayPaymentForActivation({
  provider,
  paymentStatus,
  enrollmentStatus,
  verificationStatus,
  expectedAmount,
  expectedCurrency,
  actualAmount,
  actualCurrency
}: GatewayActivationInput): GatewayActivationResult {
  if (paymentStatus === "PAID" || enrollmentStatus === "ACTIVE") {
    return {
      success: false,
      reason: "Payment has already been processed.",
      nextPaymentStatus: paymentStatus,
      nextEnrollmentStatus: enrollmentStatus
    };
  }

  if (provider !== "FLUTTERWAVE") {
    return {
      success: false,
      reason: "Only verified Flutterwave payments can activate automatically.",
      nextPaymentStatus: paymentStatus,
      nextEnrollmentStatus: enrollmentStatus
    };
  }

  if (verificationStatus !== "successful") {
    return {
      success: false,
      reason: "Payment has not been verified as successful.",
      nextPaymentStatus: paymentStatus,
      nextEnrollmentStatus: enrollmentStatus
    };
  }

  assertPaymentAmountAndCurrencyMatch({
    expectedAmount,
    expectedCurrency,
    actualAmount,
    actualCurrency
  });
  assertPaymentStatusTransition(paymentStatus, "PAID");
  assertEnrollmentStatusTransition(enrollmentStatus, "ACTIVE");

  return {
    success: true,
    nextPaymentStatus: "PAID",
    nextEnrollmentStatus: "ACTIVE"
  };
}

export function isDuplicatePaymentEvent({
  existingProviderEventId,
  currentProviderEventId
}: {
  existingProviderEventId?: string | null;
  currentProviderEventId: string;
}): boolean {
  return Boolean(
    existingProviderEventId &&
      existingProviderEventId === currentProviderEventId
  );
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
    provider: "MANUAL" as const,
    reference: normalizeOptionalText(reference),
    proofUrl: normalizeOptionalText(proofUrl),
    status: "AWAITING_VERIFICATION" as const
  };
}

export function getFlutterwavePendingPaymentData({
  parentId,
  studentId,
  enrollmentId,
  amount,
  currency,
  callbackUrl,
  metadata
}: {
  parentId: string;
  studentId: string;
  enrollmentId: string;
  amount: Prisma.Decimal | number | string;
  currency: string;
  callbackUrl: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return {
    parentId,
    studentId,
    enrollmentId,
    amount,
    currency,
    callbackUrl,
    metadata,
    paymentMethod: "FLUTTERWAVE" as const,
    provider: "FLUTTERWAVE" as const,
    status: "PENDING" as const
  };
}

export function getPaymentEventData({
  provider,
  providerEventId,
  paymentId,
  eventType,
  rawPayload,
  status,
  processedAt,
  errorMessage
}: WebhookHandleResult & {
  paymentId?: string | null;
  status: string;
  processedAt?: Date | null;
  errorMessage?: string | null;
}) {
  return {
    provider,
    providerEventId,
    paymentId: paymentId ?? null,
    eventType,
    rawPayload: rawPayload as Prisma.InputJsonValue,
    status,
    processedAt: processedAt ?? null,
    errorMessage: errorMessage ?? null
  };
}

export async function createFlutterwaveCheckoutForEnrollment(input: {
  parentId: string;
  studentId: string;
  enrollmentId: string;
  amount: Prisma.Decimal | number | string;
  currency: string;
  callbackUrl: string;
  customer: CreateCheckoutInput["customer"];
}) {
  const payment = await db.payment.create({
    data: getFlutterwavePendingPaymentData({
      parentId: input.parentId,
      studentId: input.studentId,
      enrollmentId: input.enrollmentId,
      amount: input.amount,
      currency: input.currency,
      callbackUrl: input.callbackUrl,
      metadata: {
        enrollmentId: input.enrollmentId,
        parentId: input.parentId,
        studentId: input.studentId
      }
    }),
    select: {
      id: true,
      parentId: true,
      studentId: true,
      enrollmentId: true,
      amount: true,
      currency: true
    }
  });
  const adapter = getPaymentProviderAdapter("FLUTTERWAVE");
  const checkout = await adapter.createCheckout({
    paymentId: payment.id,
    enrollmentId: payment.enrollmentId ?? input.enrollmentId,
    parentId: payment.parentId,
    studentId: payment.studentId ?? input.studentId,
    amount: payment.amount.toString(),
    currency: payment.currency,
    redirectUrl: input.callbackUrl,
    customer: input.customer
  });

  return db.payment.update({
    where: {
      id: payment.id
    },
    data: {
      checkoutUrl: checkout.checkoutUrl,
      providerReference: checkout.providerReference,
      reference: checkout.providerReference,
      metadata: {
        checkoutProvider: checkout.provider,
        checkoutUrl: checkout.checkoutUrl,
        providerReference: checkout.providerReference,
        checkoutStatus: checkout.status
      }
    }
  });
}

export async function createManualPaymentForEnrollment(input: {
  parentId: string;
  studentId: string;
  enrollmentId: string;
  amount: Prisma.Decimal | number | string;
  currency: string;
  reference?: string;
  proofUrl?: string;
}) {
  return db.payment.create({
    data: getManualPaymentData({
      parentId: input.parentId,
      studentId: input.studentId,
      enrollmentId: input.enrollmentId,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: "MANUAL_TRANSFER",
      reference: input.reference,
      proofUrl: input.proofUrl
    })
  });
}

export async function markPaymentPaidAndActivateEnrollment(input: {
  paymentId: string;
  verifiedAmount: Prisma.Decimal | number | string;
  verifiedCurrency: string;
  providerTransactionId?: string | null;
  providerReference?: string | null;
  rawPayload?: Prisma.InputJsonValue;
}) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: input.paymentId
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        enrollmentId: true,
        enrollment: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    if (!payment?.enrollment) {
      throw new PaymentSafetyError("Payment or enrollment not found.");
    }

    const validation = validateVerifiedGatewayPaymentForActivation({
      provider: payment.provider,
      paymentStatus: payment.status,
      enrollmentStatus: payment.enrollment.status,
      verificationStatus: "successful",
      expectedAmount: payment.amount,
      expectedCurrency: payment.currency,
      actualAmount: input.verifiedAmount,
      actualCurrency: input.verifiedCurrency
    });

    if (!validation.success) {
      return {
        paymentId: payment.id,
        enrollmentId: payment.enrollment.id,
        paymentStatus: validation.nextPaymentStatus,
        enrollmentStatus: validation.nextEnrollmentStatus,
        activated: false,
        reason: validation.reason
      };
    }

    const now = new Date();

    await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: validation.nextPaymentStatus,
        providerTransactionId: input.providerTransactionId ?? undefined,
        providerReference: input.providerReference ?? undefined,
        verifiedAt: now,
        paidAt: now,
        metadata: input.rawPayload ?? undefined
      }
    });

    await tx.enrollment.update({
      where: {
        id: payment.enrollment.id
      },
      data: {
        status: validation.nextEnrollmentStatus,
        startDate: now
      }
    });

    return {
      paymentId: payment.id,
      enrollmentId: payment.enrollment.id,
      paymentStatus: validation.nextPaymentStatus,
      enrollmentStatus: validation.nextEnrollmentStatus,
      activated: true
    };
  });
}

export async function markPaymentFailed(input: {
  paymentId: string;
  failureReason: string;
  providerTransactionId?: string | null;
}) {
  return db.payment.update({
    where: {
      id: input.paymentId
    },
    data: {
      status: "FAILED",
      failureReason: input.failureReason,
      providerTransactionId: input.providerTransactionId ?? undefined
    }
  });
}

export async function verifyFlutterwavePaymentAndActivateEnrollment(input: {
  paymentId: string;
  transactionId: string;
}) {
  const adapter = getPaymentProviderAdapter("FLUTTERWAVE");
  const verification = await adapter.verifyPayment({
    transactionId: input.transactionId
  });

  if (verification.status !== "successful") {
    return markPaymentFailed({
      paymentId: input.paymentId,
      failureReason: "Flutterwave transaction was not successful.",
      providerTransactionId: verification.providerTransactionId
    });
  }

  return markPaymentPaidAndActivateEnrollment({
    paymentId: input.paymentId,
    verifiedAmount: verification.amount,
    verifiedCurrency: verification.currency,
    providerTransactionId: verification.providerTransactionId,
    providerReference: verification.providerReference,
    rawPayload: verification.rawPayload as Prisma.InputJsonValue
  });
}

export async function recordPaymentEvent(input: WebhookHandleResult) {
  const existingEvent = await db.paymentEvent.findUnique({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId
      }
    },
    select: {
      id: true,
      providerEventId: true
    }
  });

  if (
    isDuplicatePaymentEvent({
      existingProviderEventId: existingEvent?.providerEventId ?? null,
      currentProviderEventId: input.providerEventId
    })
  ) {
    return {
      duplicate: true,
      eventId: existingEvent?.id ?? null
    };
  }

  const event = await db.paymentEvent.create({
    data: getPaymentEventData({
      ...input,
      status: "RECEIVED"
    }),
    select: {
      id: true
    }
  });

  return {
    duplicate: false,
    eventId: event.id
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
