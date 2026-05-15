"use server";

import type { LessonStatus } from "@prisma/client";

import { AuthError, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createLessonSchema,
  updateLessonStatusSchema,
  type CreateLessonInput,
  type UpdateLessonStatusInput
} from "@/lib/validations/lesson.schema";
import {
  LessonSchedulingError,
  LessonStatusTransitionError,
  assertLessonStatusTransition,
  assertLessonTimeIsValid,
  getLessonScheduledNotificationPayloads,
  getLessonStatusNotificationPayload,
  validateLessonScheduling
} from "@/server/services/lesson.service";

type LessonFieldErrors = Partial<
  Record<keyof CreateLessonInput | keyof UpdateLessonStatusInput, string>
>;

export type LessonActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: LessonFieldErrors;
  data?: {
    lessonId: string;
    status: LessonStatus;
  };
};

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED" ? "Authentication required." : deniedMessage
    } satisfies LessonActionResult;
  }

  return null;
}

function toLessonErrorResult(error: unknown) {
  if (
    error instanceof LessonSchedulingError ||
    error instanceof LessonStatusTransitionError
  ) {
    return {
      success: false,
      message: error.message
    } satisfies LessonActionResult;
  }

  return null;
}

export async function createLessonAction(
  payload: CreateLessonInput
): Promise<LessonActionResult> {
  try {
    const parsed = createLessonSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the lesson fields and try again.",
        fieldErrors: {
          enrollmentId: flattened.enrollmentId?.[0],
          studentId: flattened.studentId?.[0],
          tutorId: flattened.tutorId?.[0],
          subjectId: flattened.subjectId?.[0],
          title: flattened.title?.[0],
          startTime: flattened.startTime?.[0],
          endTime: flattened.endTime?.[0],
          timezone: flattened.timezone?.[0],
          meetingLink: flattened.meetingLink?.[0]
        }
      };
    }

    const user = await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const [enrollment, tutor, subject] = await Promise.all([
        tx.enrollment.findUnique({
          where: {
            id: parsed.data.enrollmentId
          },
          select: {
            id: true,
            parentId: true,
            studentId: true,
            assignedTutorId: true,
            status: true,
            parent: {
              select: {
                userId: true
              }
            }
          }
        }),
        tx.tutorProfile.findUnique({
          where: {
            id: parsed.data.tutorId
          },
          select: {
            id: true,
            status: true,
            userId: true
          }
        }),
        tx.subject.findUnique({
          where: {
            id: parsed.data.subjectId
          },
          select: {
            id: true
          }
        })
      ]);

      if (!enrollment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Enrollment not found.",
            fieldErrors: {
              enrollmentId: "Enrollment not found."
            }
          } satisfies LessonActionResult
        };
      }

      const scheduling = validateLessonScheduling({
        currentRole: user.role,
        enrollmentStatus: enrollment.status,
        enrollmentParentId: enrollment.parentId,
        enrollmentStudentId: enrollment.studentId,
        requestedStudentId: parsed.data.studentId,
        assignedTutorId: enrollment.assignedTutorId,
        requestedTutorId: parsed.data.tutorId,
        tutorExists: Boolean(tutor),
        tutorStatus: tutor?.status ?? null,
        subjectExists: Boolean(subject)
      });

      if (!scheduling.success) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: scheduling.message,
            fieldErrors: scheduling.fieldErrors
          } satisfies LessonActionResult
        };
      }

      assertLessonTimeIsValid(parsed.data.startTime, parsed.data.endTime);

      const lesson = await tx.lesson.create({
        data: {
          parentId: enrollment.parentId,
          studentId: enrollment.studentId,
          tutorId: parsed.data.tutorId,
          subjectId: parsed.data.subjectId,
          enrollmentId: enrollment.id,
          title: parsed.data.title.trim(),
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          timezone: parsed.data.timezone.trim(),
          meetingLink: parsed.data.meetingLink?.trim() || null,
          status: "SCHEDULED"
        },
        select: {
          id: true,
          status: true
        }
      });

      const payloads = getLessonScheduledNotificationPayloads(lesson.id);
      await tx.notification.createMany({
        data: [
          {
            userId: enrollment.parent.userId,
            ...payloads.parent
          },
          {
            userId: tutor!.userId,
            ...payloads.tutor
          }
        ]
      });

      return {
        kind: "success" as const,
        lesson
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Lesson scheduled.",
      data: {
        lessonId: result.lesson.id,
        status: result.lesson.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can schedule lessons."
    );
    if (authResult) {
      return authResult;
    }

    const lessonResult = toLessonErrorResult(error);
    if (lessonResult) {
      return lessonResult;
    }

    throw error;
  }
}

export async function updateLessonStatusAction(
  payload: UpdateLessonStatusInput
): Promise<LessonActionResult> {
  try {
    const parsed = updateLessonStatusSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the lesson status fields and try again.",
        fieldErrors: {
          lessonId: flattened.lessonId?.[0],
          status: flattened.status?.[0]
        }
      };
    }

    await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const lesson = await tx.lesson.findUnique({
        where: {
          id: parsed.data.lessonId
        },
        select: {
          id: true,
          status: true,
          parent: {
            select: {
              userId: true
            }
          },
          tutor: {
            select: {
              userId: true
            }
          }
        }
      });

      if (!lesson) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Lesson not found.",
            fieldErrors: {
              lessonId: "Lesson not found."
            }
          } satisfies LessonActionResult
        };
      }

      assertLessonStatusTransition(lesson.status, parsed.data.status);

      const updatedLesson = await tx.lesson.update({
        where: {
          id: lesson.id
        },
        data: {
          status: parsed.data.status
        },
        select: {
          id: true,
          status: true
        }
      });

      const notification = getLessonStatusNotificationPayload(
        updatedLesson.id,
        updatedLesson.status
      );

      if (notification) {
        await tx.notification.createMany({
          data: [
            {
              userId: lesson.parent.userId,
              ...notification
            },
            {
              userId: lesson.tutor.userId,
              ...notification,
              href: `/tutor/lessons/${lesson.id}`
            }
          ]
        });
      }

      return {
        kind: "success" as const,
        lesson: updatedLesson
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Lesson status updated.",
      data: {
        lessonId: result.lesson.id,
        status: result.lesson.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can update lesson status."
    );
    if (authResult) {
      return authResult;
    }

    const lessonResult = toLessonErrorResult(error);
    if (lessonResult) {
      return lessonResult;
    }

    throw error;
  }
}
