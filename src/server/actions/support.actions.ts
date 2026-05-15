"use server";

import type { SupportStatus } from "@prisma/client";

import { AuthError, requireAdmin, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  closeSupportRequestSchema,
  createSupportRequestSchema,
  updateSupportRequestSchema,
  type CloseSupportRequestInput,
  type CreateSupportRequestInput,
  type UpdateSupportRequestInput
} from "@/lib/validations/support.schema";
import {
  SupportAccessError,
  SupportStatusTransitionError,
  assertCanCreateSupportRequest,
  assertParentCanLinkSupportRecord,
  assertSupportStatusTransition,
  getSupportSubmittedAdminNotificationPayload,
  getSupportUpdatedParentNotificationPayload
} from "@/server/services/support.service";

type SupportFieldErrors = Partial<
  Record<
    | keyof CreateSupportRequestInput
    | keyof UpdateSupportRequestInput
    | keyof CloseSupportRequestInput,
    string
  >
>;

export type SupportActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: SupportFieldErrors;
  data?: {
    supportRequestId: string;
    status: SupportStatus;
  };
};

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED" ? "Authentication required." : deniedMessage
    } satisfies SupportActionResult;
  }

  return null;
}

function toSupportErrorResult(error: unknown) {
  if (
    error instanceof SupportAccessError ||
    error instanceof SupportStatusTransitionError
  ) {
    return {
      success: false,
      message: error.message
    } satisfies SupportActionResult;
  }

  return null;
}

function createSupportFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): SupportFieldErrors {
  return {
    subject: fieldErrors.subject?.[0],
    message: fieldErrors.message?.[0],
    studentId: fieldErrors.studentId?.[0],
    lessonId: fieldErrors.lessonId?.[0],
    paymentId: fieldErrors.paymentId?.[0],
    assessmentRequestId: fieldErrors.assessmentRequestId?.[0],
    supportRequestId: fieldErrors.supportRequestId?.[0],
    status: fieldErrors.status?.[0],
    adminReply: fieldErrors.adminReply?.[0]
  };
}

export async function createSupportRequestAction(
  payload: CreateSupportRequestInput
): Promise<SupportActionResult> {
  try {
    const parsed = createSupportRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the support request fields and try again.",
        fieldErrors: createSupportFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireParent();
    assertCanCreateSupportRequest(user.role);

    const result = await db.$transaction(async (tx) => {
      const parent = await tx.parentProfile.findUnique({
        where: {
          userId: user.id
        },
        select: {
          id: true
        }
      });

      if (!parent) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Complete your parent profile before creating support requests."
          } satisfies SupportActionResult
        };
      }

      const [student, lesson, payment, assessment] = await Promise.all([
        parsed.data.studentId
          ? tx.studentProfile.findFirst({
              where: {
                id: parsed.data.studentId,
                parentId: parent.id
              },
              select: {
                id: true
              }
            })
          : Promise.resolve({ id: "not-linked" }),
        parsed.data.lessonId
          ? tx.lesson.findFirst({
              where: {
                id: parsed.data.lessonId,
                parentId: parent.id
              },
              select: {
                id: true
              }
            })
          : Promise.resolve({ id: "not-linked" }),
        parsed.data.paymentId
          ? tx.payment.findFirst({
              where: {
                id: parsed.data.paymentId,
                parentId: parent.id
              },
              select: {
                id: true
              }
            })
          : Promise.resolve({ id: "not-linked" }),
        parsed.data.assessmentRequestId
          ? tx.assessmentRequest.findFirst({
              where: {
                id: parsed.data.assessmentRequestId,
                parentId: parent.id
              },
              select: {
                id: true
              }
            })
          : Promise.resolve({ id: "not-linked" })
      ]);

      assertParentCanLinkSupportRecord({
        studentBelongsToParent: Boolean(student),
        lessonBelongsToParent: Boolean(lesson),
        paymentBelongsToParent: Boolean(payment),
        assessmentBelongsToParent: Boolean(assessment)
      });

      const supportRequest = await tx.supportRequest.create({
        data: {
          parentId: parent.id,
          studentId: parsed.data.studentId ?? null,
          lessonId: parsed.data.lessonId ?? null,
          paymentId: parsed.data.paymentId ?? null,
          assessmentRequestId: parsed.data.assessmentRequestId ?? null,
          subject: parsed.data.subject.trim(),
          message: parsed.data.message.trim(),
          status: "OPEN"
        },
        select: {
          id: true,
          status: true
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
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            ...getSupportSubmittedAdminNotificationPayload(supportRequest.id)
          }))
        });
      }

      return {
        kind: "success" as const,
        supportRequest
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Support request submitted.",
      data: {
        supportRequestId: result.supportRequest.id,
        status: result.supportRequest.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only parents can create support requests."
    );
    if (authResult) {
      return authResult;
    }

    const supportResult = toSupportErrorResult(error);
    if (supportResult) {
      return supportResult;
    }

    throw error;
  }
}

export async function updateSupportRequestAction(
  payload: UpdateSupportRequestInput
): Promise<SupportActionResult> {
  try {
    const parsed = updateSupportRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the support request fields and try again.",
        fieldErrors: createSupportFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const supportRequest = await tx.supportRequest.findUnique({
        where: {
          id: parsed.data.supportRequestId
        },
        select: {
          id: true,
          status: true,
          parent: {
            select: {
              userId: true
            }
          }
        }
      });

      if (!supportRequest) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Support request not found.",
            fieldErrors: {
              supportRequestId: "Support request not found."
            }
          } satisfies SupportActionResult
        };
      }

      if (supportRequest.status !== parsed.data.status) {
        assertSupportStatusTransition(supportRequest.status, parsed.data.status, {
          role: "ADMIN"
        });
      }

      const updated = await tx.supportRequest.update({
        where: {
          id: supportRequest.id
        },
        data: {
          status: parsed.data.status,
          ...(parsed.data.adminReply !== undefined
            ? { adminReply: parsed.data.adminReply }
            : {})
        },
        select: {
          id: true,
          status: true
        }
      });

      await tx.notification.create({
        data: {
          userId: supportRequest.parent.userId,
          ...getSupportUpdatedParentNotificationPayload(updated.id)
        }
      });

      return {
        kind: "success" as const,
        supportRequest: updated
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Support request updated.",
      data: {
        supportRequestId: result.supportRequest.id,
        status: result.supportRequest.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can update support requests."
    );
    if (authResult) {
      return authResult;
    }

    const supportResult = toSupportErrorResult(error);
    if (supportResult) {
      return supportResult;
    }

    throw error;
  }
}

export async function closeSupportRequestAction(
  payload: CloseSupportRequestInput
): Promise<SupportActionResult> {
  try {
    const parsed = closeSupportRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid support request.",
        fieldErrors: createSupportFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    return updateSupportRequestAction({
      supportRequestId: parsed.data.supportRequestId,
      status: "CLOSED"
    });
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can close support requests."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}
