"use server";

import type { PaymentStatus } from "@prisma/client";

import { AuthError, requireAdmin, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createEnrollmentPaymentSchema,
  createManualPaymentSchema,
  reviewPaymentSchema,
  updatePaymentAdminNoteSchema,
  type CreateEnrollmentPaymentInput,
  type CreateManualPaymentInput,
  type ReviewPaymentInput,
  type UpdatePaymentAdminNoteInput
} from "@/lib/validations/payment.schema";
import { PaymentProviderConfigurationError } from "@/server/integrations/payments/payment-provider";
import { assertEnrollmentStatusTransition } from "@/server/services/enrollment.service";
import {
  PaymentStatusTransitionError,
  getFlutterwaveCheckoutUpdateData,
  getFlutterwavePendingPaymentData,
  getEnrollmentActivatedNotificationPayload,
  getAdminPaymentSubmittedNotificationPayload,
  getManualPaymentData,
  getPaymentApprovedNotificationPayload,
  getPaymentProviderAdapter,
  getPaymentRejectedNotificationPayload,
  getParentPaymentSubmittedNotificationPayload,
  validateEnrollmentPaymentRequest,
  validateManualPaymentSubmission,
  validatePaymentReview
} from "@/server/services/payment.service";

type PaymentFieldErrors = Partial<
  Record<
    | keyof CreateManualPaymentInput
    | keyof CreateEnrollmentPaymentInput
    | keyof ReviewPaymentInput
    | keyof UpdatePaymentAdminNoteInput,
    string
  >
>;

export type PaymentActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: PaymentFieldErrors;
  data?: {
    paymentId: string;
    enrollmentId: string;
    status: PaymentStatus;
    paymentMethod?: CreateEnrollmentPaymentInput["paymentMethod"];
    redirectUrl?: string | null;
    checkoutUrl?: string | null;
    successRoute?: string;
  };
};

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : deniedMessage
    } satisfies PaymentActionResult;
  }

  return null;
}

function toPaymentTransitionErrorResult(error: unknown) {
  if (error instanceof PaymentStatusTransitionError) {
    return {
      success: false,
      message: error.message
    } satisfies PaymentActionResult;
  }

  return null;
}

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:7000"
  ).replace(/\/+$/, "");
}

function getPaymentReturnUrl() {
  return `${getAppBaseUrl()}/parent/payments`;
}

export async function createEnrollmentPaymentAction(
  payload: CreateEnrollmentPaymentInput
): Promise<PaymentActionResult> {
  try {
    const parsed = createEnrollmentPaymentSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the payment fields and try again.",
        fieldErrors: {
          enrollmentId: flattened.enrollmentId?.[0],
          paymentMethod: flattened.paymentMethod?.[0],
          reference: flattened.reference?.[0],
          proofUrl: flattened.proofUrl?.[0]
        }
      };
    }

    const user = await requireParent();

    const enrollment = await db.enrollment.findFirst({
      where: {
        id: parsed.data.enrollmentId,
        parent: {
          userId: user.id
        }
      },
      select: {
        id: true,
        parentId: true,
        studentId: true,
        status: true,
        parent: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        student: {
          select: {
            fullName: true
          }
        },
        tutoringPlan: {
          select: {
            name: true,
            monthlyPrice: true,
            currency: true
          }
        },
        payments: {
          where: {
            status: {
              in: ["PENDING", "AWAITING_VERIFICATION", "PAID"]
            }
          },
          select: {
            id: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    if (!enrollment) {
      return {
        success: false,
        message: "Enrollment not found.",
        fieldErrors: {
          enrollmentId: "Enrollment not found."
        }
      };
    }

    const paymentAccess = validateEnrollmentPaymentRequest({
      currentUserId: user.id,
      enrollmentParentUserId: enrollment.parent.userId,
      enrollmentStatus: enrollment.status,
      existingOpenPaymentId: enrollment.payments[0]?.id ?? null
    });

    if (!paymentAccess.success) {
      return {
        success: false,
        message: paymentAccess.message,
        fieldErrors: paymentAccess.fieldErrors
      };
    }

    if (parsed.data.paymentMethod === "MANUAL_TRANSFER") {
      const result = await db.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: getManualPaymentData({
            parentId: enrollment.parentId,
            studentId: enrollment.studentId,
            enrollmentId: enrollment.id,
            amount: enrollment.tutoringPlan.monthlyPrice,
            currency: enrollment.tutoringPlan.currency,
            paymentMethod: "MANUAL_TRANSFER",
            reference: parsed.data.reference,
            proofUrl: parsed.data.proofUrl
          }),
          select: {
            id: true,
            enrollmentId: true,
            status: true
          }
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            ...getParentPaymentSubmittedNotificationPayload(payment.id)
          },
          select: {
            id: true
          }
        });

        const admins = await tx.user.findMany({
          where: {
            role: "ADMIN"
          },
          select: {
            id: true
          }
        });

        if (admins.length > 0) {
          const adminPayload = getAdminPaymentSubmittedNotificationPayload({
            parentName: enrollment.parent.user.name,
            childName: enrollment.student.fullName,
            planName: enrollment.tutoringPlan.name
          });

          await tx.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              ...adminPayload
            }))
          });
        }

        return payment;
      });

      return {
        success: true,
        message:
          "Your manual transfer details have been submitted for TopMox review.",
        data: {
          paymentId: result.id,
          enrollmentId: result.enrollmentId ?? parsed.data.enrollmentId,
          status: result.status,
          paymentMethod: parsed.data.paymentMethod,
          successRoute: "/parent/payments?submitted=1"
        }
      };
    }

    const callbackUrl = getPaymentReturnUrl();
    const payment = await db.payment.create({
      data: getFlutterwavePendingPaymentData({
        parentId: enrollment.parentId,
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        amount: enrollment.tutoringPlan.monthlyPrice,
        currency: enrollment.tutoringPlan.currency,
        callbackUrl,
        metadata: {
          source: "parent_checkout",
          enrollmentId: enrollment.id,
          parentId: enrollment.parentId,
          studentId: enrollment.studentId
        }
      }),
      select: {
        id: true,
        parentId: true,
        studentId: true,
        enrollmentId: true,
        amount: true,
        currency: true,
        status: true
      }
    });

    try {
      const checkout = await getPaymentProviderAdapter(
        "FLUTTERWAVE"
      ).createCheckout({
        paymentId: payment.id,
        enrollmentId: payment.enrollmentId ?? enrollment.id,
        parentId: payment.parentId,
        studentId: payment.studentId ?? enrollment.studentId,
        amount: payment.amount.toString(),
        currency: payment.currency,
        redirectUrl: callbackUrl,
        customer: {
          email: user.email,
          name: user.name ?? enrollment.parent.user.name ?? "TopMox Parent"
        }
      });

      const updatedPayment = await db.payment.update({
        where: {
          id: payment.id
        },
        data: getFlutterwaveCheckoutUpdateData(checkout),
        select: {
          id: true,
          enrollmentId: true,
          status: true,
          checkoutUrl: true
        }
      });

      if (!updatedPayment.checkoutUrl) {
        return {
          success: false,
          message: "Flutterwave checkout could not be created."
        };
      }

      return {
        success: true,
        message: "Redirecting to Flutterwave checkout.",
        data: {
          paymentId: updatedPayment.id,
          enrollmentId: updatedPayment.enrollmentId ?? parsed.data.enrollmentId,
          status: updatedPayment.status,
          paymentMethod: parsed.data.paymentMethod,
          redirectUrl: updatedPayment.checkoutUrl,
          checkoutUrl: updatedPayment.checkoutUrl
        }
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Flutterwave checkout could not be created.";

      await db.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: "FAILED",
          failureReason: message
        },
        select: {
          id: true
        }
      });

      if (error instanceof PaymentProviderConfigurationError) {
        return {
          success: false,
          message:
            "Flutterwave is not configured yet. Please use manual transfer or contact TopMox."
        };
      }

      return {
        success: false,
        message
      };
    }
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to start payment for this plan."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function createManualPaymentAction(
  payload: CreateManualPaymentInput
): Promise<PaymentActionResult> {
  try {
    const parsed = createManualPaymentSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the payment fields and try again.",
        fieldErrors: {
          enrollmentId: flattened.enrollmentId?.[0],
          paymentMethod: flattened.paymentMethod?.[0],
          reference: flattened.reference?.[0],
          proofUrl: flattened.proofUrl?.[0]
        }
      };
    }

    const user = await requireParent();

    const result = await db.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findFirst({
        where: {
          id: parsed.data.enrollmentId,
          parent: {
            userId: user.id
          }
        },
        select: {
          id: true,
          parentId: true,
          studentId: true,
          status: true,
          parent: {
            select: {
              userId: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          student: {
            select: {
              fullName: true
            }
          },
          tutoringPlan: {
            select: {
              name: true,
              monthlyPrice: true,
              currency: true
            }
          },
          payments: {
            where: {
              status: {
                in: ["PENDING", "AWAITING_VERIFICATION", "PAID"]
              }
            },
            select: {
              id: true
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      });

      if (!enrollment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Enrollment not found.",
            fieldErrors: {
              enrollmentId: "Enrollment not found."
            }
          } satisfies PaymentActionResult
        };
      }

      const paymentAccess = validateManualPaymentSubmission({
        currentUserId: user.id,
        enrollmentParentUserId: enrollment.parent.userId,
        enrollmentStatus: enrollment.status,
        existingVerificationPaymentId: enrollment.payments[0]?.id ?? null
      });

      if (!paymentAccess.success) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: paymentAccess.message,
            fieldErrors: paymentAccess.fieldErrors
          } satisfies PaymentActionResult
        };
      }

      const payment = await tx.payment.create({
        data: getManualPaymentData({
          parentId: enrollment.parentId,
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          amount: enrollment.tutoringPlan.monthlyPrice,
          currency: enrollment.tutoringPlan.currency,
          paymentMethod: parsed.data.paymentMethod,
          reference: parsed.data.reference,
          proofUrl: parsed.data.proofUrl
        }),
        select: {
          id: true,
          enrollmentId: true,
          status: true
        }
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          ...getParentPaymentSubmittedNotificationPayload(payment.id)
        },
        select: {
          id: true
        }
      });

      const admins = await tx.user.findMany({
        where: {
          role: "ADMIN"
        },
        select: {
          id: true
        }
      });

      if (admins.length > 0) {
        const adminPayload = getAdminPaymentSubmittedNotificationPayload({
          parentName: enrollment.parent.user.name,
          childName: enrollment.student.fullName,
          planName: enrollment.tutoringPlan.name
        });

        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            ...adminPayload
          }))
        });
      }

      return {
        kind: "success" as const,
        payment
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message:
        "Your payment has been submitted for review. TopMox will verify it before activating the tutoring plan.",
      data: {
        paymentId: result.payment.id,
        enrollmentId: result.payment.enrollmentId ?? parsed.data.enrollmentId,
        status: result.payment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to submit payment details."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function reviewPaymentAction(
  payload: ReviewPaymentInput
): Promise<PaymentActionResult> {
  try {
    const parsed = reviewPaymentSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the payment review fields and try again.",
        fieldErrors: {
          paymentId: flattened.paymentId?.[0],
          decision: flattened.decision?.[0],
          adminNote: flattened.adminNote?.[0]
        }
      };
    }

    const user = await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: {
          id: parsed.data.paymentId
        },
        select: {
          id: true,
          enrollmentId: true,
          status: true,
          parent: {
            select: {
              userId: true
            }
          },
          enrollment: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      if (!payment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Payment not found.",
            fieldErrors: {
              paymentId: "Payment not found."
            }
          } satisfies PaymentActionResult
        };
      }

      const review = validatePaymentReview({
        currentRole: user.role,
        paymentStatus: payment.status,
        enrollmentStatus: payment.enrollment?.status ?? null,
        decision: parsed.data.decision
      });

      if (!review.success) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: review.message,
            fieldErrors: review.fieldErrors
          } satisfies PaymentActionResult
        };
      }

      if (
        parsed.data.decision === "APPROVE" &&
        payment.enrollment?.status === "PENDING_PAYMENT"
      ) {
        assertEnrollmentStatusTransition(payment.enrollment.status, "ACTIVE");
      }

      const reviewedAt = new Date();
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: review.nextPaymentStatus,
          adminNote: parsed.data.adminNote?.trim() || null,
          verifiedAt: parsed.data.decision === "APPROVE" ? reviewedAt : null,
          paidAt: parsed.data.decision === "APPROVE" ? reviewedAt : null
        },
        select: {
          id: true,
          enrollmentId: true,
          status: true
        }
      });

      if (
        parsed.data.decision === "APPROVE" &&
        payment.enrollmentId &&
        review.nextEnrollmentStatus === "ACTIVE"
      ) {
        await tx.enrollment.update({
          where: {
            id: payment.enrollmentId
          },
          data: {
            status: "ACTIVE",
            startDate: reviewedAt
          },
          select: {
            id: true
          }
        });
      }

      if (parsed.data.decision === "APPROVE") {
        await tx.notification.createMany({
          data: [
            {
              userId: payment.parent.userId,
              ...getPaymentApprovedNotificationPayload(payment.id)
            },
            ...(payment.enrollmentId
              ? [
                  {
                    userId: payment.parent.userId,
                    ...getEnrollmentActivatedNotificationPayload(
                      payment.enrollmentId
                    )
                  }
                ]
              : [])
          ]
        });
      } else {
        await tx.notification.create({
          data: {
            userId: payment.parent.userId,
            ...getPaymentRejectedNotificationPayload(payment.id)
          },
          select: {
            id: true
          }
        });
      }

      return {
        kind: "success" as const,
        payment: updatedPayment
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message:
        parsed.data.decision === "APPROVE"
          ? "Payment approved and enrollment activated."
          : "Payment rejected. Enrollment remains pending payment.",
      data: {
        paymentId: result.payment.id,
        enrollmentId: result.payment.enrollmentId ?? "",
        status: result.payment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to review payments."
    );
    if (authResult) {
      return authResult;
    }

    const transitionResult = toPaymentTransitionErrorResult(error);
    if (transitionResult) {
      return transitionResult;
    }

    throw error;
  }
}

export async function updatePaymentAdminNoteAction(
  payload: UpdatePaymentAdminNoteInput
): Promise<PaymentActionResult> {
  try {
    const parsed = updatePaymentAdminNoteSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the admin note fields and try again.",
        fieldErrors: {
          paymentId: flattened.paymentId?.[0],
          adminNote: flattened.adminNote?.[0]
        }
      };
    }

    await requireAdmin();

    const payment = await db.payment.findUnique({
      where: {
        id: parsed.data.paymentId
      },
      select: {
        id: true,
        enrollmentId: true,
        status: true
      }
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found.",
        fieldErrors: {
          paymentId: "Payment not found."
        }
      };
    }

    const updatedPayment = await db.payment.update({
      where: {
        id: parsed.data.paymentId
      },
      data: {
        adminNote: parsed.data.adminNote?.trim() || null
      },
      select: {
        id: true,
        enrollmentId: true,
        status: true
      }
    });

    return {
      success: true,
      message: "Payment admin note saved.",
      data: {
        paymentId: updatedPayment.id,
        enrollmentId: updatedPayment.enrollmentId ?? "",
        status: updatedPayment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to update payment notes."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}
