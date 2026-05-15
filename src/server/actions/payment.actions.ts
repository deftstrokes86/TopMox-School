"use server";

import type { PaymentStatus } from "@prisma/client";

import { AuthError, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createManualPaymentSchema,
  type CreateManualPaymentInput
} from "@/lib/validations/payment.schema";
import {
  getAdminPaymentSubmittedNotificationPayload,
  getManualPaymentData,
  getParentPaymentSubmittedNotificationPayload,
  validateManualPaymentSubmission
} from "@/server/services/payment.service";

type PaymentFieldErrors = Partial<
  Record<keyof CreateManualPaymentInput, string>
>;

export type PaymentActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: PaymentFieldErrors;
  data?: {
    paymentId: string;
    enrollmentId: string;
    status: PaymentStatus;
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
                in: ["AWAITING_VERIFICATION", "PAID"]
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
