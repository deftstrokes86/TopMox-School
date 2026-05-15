"use server";

import { AuthError, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assignTutorToEnrollmentSchema,
  type AssignTutorToEnrollmentInput
} from "@/lib/validations/tutor.schema";
import {
  getParentTutorAssignedNotificationPayload,
  getTutorAssignedNotificationPayload,
  validateTutorAssignment
} from "@/server/services/tutor-assignment.service";

type TutorAssignmentFieldErrors = Partial<
  Record<keyof AssignTutorToEnrollmentInput, string>
>;

export type TutorAssignmentActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: TutorAssignmentFieldErrors;
  data?: {
    enrollmentId: string;
    tutorId: string;
  };
};

function toAuthErrorResult(error: unknown) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : "Only admins can assign tutors."
    } satisfies TutorAssignmentActionResult;
  }

  return null;
}

export async function assignTutorToEnrollmentAction(
  payload: AssignTutorToEnrollmentInput
): Promise<TutorAssignmentActionResult> {
  try {
    const parsed = assignTutorToEnrollmentSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the tutor assignment fields and try again.",
        fieldErrors: {
          enrollmentId: flattened.enrollmentId?.[0],
          tutorId: flattened.tutorId?.[0]
        }
      };
    }

    const user = await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: {
          id: parsed.data.enrollmentId
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

      if (!enrollment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Enrollment not found.",
            fieldErrors: {
              enrollmentId: "Enrollment not found."
            }
          } satisfies TutorAssignmentActionResult
        };
      }

      const tutor = await tx.tutorProfile.findUnique({
        where: {
          id: parsed.data.tutorId
        },
        select: {
          id: true,
          status: true,
          userId: true,
          user: {
            select: {
              role: true
            }
          }
        }
      });

      const assignment = validateTutorAssignment({
        currentRole: user.role,
        enrollmentStatus: enrollment.status,
        tutorExists: Boolean(tutor),
        tutorUserRole: tutor?.user.role ?? null,
        tutorStatus: tutor?.status ?? null
      });

      if (!assignment.success) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: assignment.message,
            fieldErrors: assignment.fieldErrors
          } satisfies TutorAssignmentActionResult
        };
      }

      const updatedEnrollment = await tx.enrollment.update({
        where: {
          id: enrollment.id
        },
        data: {
          assignedTutorId: parsed.data.tutorId
        },
        select: {
          id: true,
          assignedTutorId: true
        }
      });

      await tx.notification.createMany({
        data: [
          {
            userId: enrollment.parent.userId,
            ...getParentTutorAssignedNotificationPayload(enrollment.id)
          },
          {
            userId: tutor!.userId,
            ...getTutorAssignedNotificationPayload(enrollment.id)
          }
        ]
      });

      return {
        kind: "success" as const,
        enrollment: updatedEnrollment
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Tutor assigned to active enrollment.",
      data: {
        enrollmentId: result.enrollment.id,
        tutorId: result.enrollment.assignedTutorId ?? parsed.data.tutorId
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}
