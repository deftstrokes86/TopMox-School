"use server";

import type { EnrollmentStatus } from "@prisma/client";

import { AuthError, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  acceptRecommendedPlanSchema,
  type AcceptRecommendedPlanInput
} from "@/lib/validations/enrollment.schema";
import { assertAssessmentStatusTransition } from "@/server/services/assessment.service";
import {
  getAcceptedAssessmentStatus,
  getAdminPlanAcceptedNotificationPayload,
  getParentPlanAcceptedNotificationPayload,
  getPendingEnrollmentData,
  validateRecommendedPlanAcceptance
} from "@/server/services/enrollment.service";

type EnrollmentFieldErrors = Partial<
  Record<keyof AcceptRecommendedPlanInput, string>
>;

export type EnrollmentActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: EnrollmentFieldErrors;
  data?: {
    assessmentRequestId: string;
    enrollmentId: string;
    status: EnrollmentStatus;
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
    } satisfies EnrollmentActionResult;
  }

  return null;
}

export async function acceptRecommendedPlanAction(
  payload: AcceptRecommendedPlanInput
): Promise<EnrollmentActionResult> {
  try {
    const parsed = acceptRecommendedPlanSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the recommended plan fields and try again.",
        fieldErrors: {
          assessmentRequestId: flattened.assessmentRequestId?.[0],
          recommendedPlanId: flattened.recommendedPlanId?.[0]
        }
      };
    }

    const user = await requireParent();

    const result = await db.$transaction(async (tx) => {
      const assessment = await tx.assessmentRequest.findFirst({
        where: {
          id: parsed.data.assessmentRequestId,
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
          outcome: {
            select: {
              recommendedPlanId: true,
              recommendedPlan: {
                select: {
                  id: true,
                  name: true,
                  isActive: true
                }
              }
            }
          }
        }
      });

      if (!assessment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Assessment request not found.",
            fieldErrors: {
              assessmentRequestId: "Assessment request not found."
            }
          } satisfies EnrollmentActionResult
        };
      }

      const existingEnrollment = await tx.enrollment.findFirst({
        where: {
          parentId: assessment.parentId,
          studentId: assessment.studentId,
          tutoringPlanId: parsed.data.recommendedPlanId,
          status: {
            not: "CANCELLED"
          }
        },
        select: {
          id: true
        }
      });

      const acceptance = validateRecommendedPlanAcceptance({
        currentUserId: user.id,
        assessmentParentUserId: assessment.parent.userId,
        assessmentStatus: assessment.status,
        outcomeRecommendedPlanId: assessment.outcome?.recommendedPlanId ?? null,
        requestedPlanId: parsed.data.recommendedPlanId,
        recommendedPlanIsActive:
          assessment.outcome?.recommendedPlan?.isActive ?? false,
        existingEnrollmentId: existingEnrollment?.id ?? null
      });

      if (!acceptance.success) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: acceptance.message,
            fieldErrors: acceptance.fieldErrors
          } satisfies EnrollmentActionResult
        };
      }

      assertAssessmentStatusTransition(
        assessment.status,
        getAcceptedAssessmentStatus()
      );

      const enrollment = await tx.enrollment.create({
        data: getPendingEnrollmentData({
          parentId: assessment.parentId,
          studentId: assessment.studentId,
          recommendedPlanId: parsed.data.recommendedPlanId,
          assessmentRequestId: assessment.id
        }),
        select: {
          id: true,
          status: true
        }
      });

      await tx.assessmentRequest.update({
        where: {
          id: assessment.id
        },
        data: {
          status: getAcceptedAssessmentStatus()
        },
        select: {
          id: true
        }
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          ...getParentPlanAcceptedNotificationPayload(enrollment.id)
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
        const adminPayload = getAdminPlanAcceptedNotificationPayload({
          parentName: assessment.parent.user.name,
          childName: assessment.student.fullName,
          planName: assessment.outcome?.recommendedPlan?.name ?? "a plan"
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
        enrollment
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message:
        "Recommended plan accepted. Your enrollment is pending payment verification.",
      data: {
        assessmentRequestId: parsed.data.assessmentRequestId,
        enrollmentId: result.enrollment.id,
        status: result.enrollment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to accept this recommended plan."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}
