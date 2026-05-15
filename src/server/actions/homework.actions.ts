"use server";

import { AuthError, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assignHomeworkSchema,
  type AssignHomeworkInput
} from "@/lib/validations/homework.schema";

type HomeworkFieldErrors = Partial<Record<keyof AssignHomeworkInput, string>>;

export type HomeworkActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: HomeworkFieldErrors;
  data?: {
    homeworkId: string;
  };
};

function toAuthErrorResult(error: unknown) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : "Only assigned tutors can assign homework."
    } satisfies HomeworkActionResult;
  }

  return null;
}

export async function assignHomeworkAction(
  payload: AssignHomeworkInput
): Promise<HomeworkActionResult> {
  try {
    const parsed = assignHomeworkSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the homework fields and try again.",
        fieldErrors: {
          lessonId: flattened.lessonId?.[0],
          title: flattened.title?.[0],
          description: flattened.description?.[0],
          dueDate: flattened.dueDate?.[0]
        }
      };
    }

    const user = await requireTutor();

    const result = await db.$transaction(async (tx) => {
      const lesson = await tx.lesson.findFirst({
        where: {
          id: parsed.data.lessonId,
          tutor: {
            userId: user.id
          }
        },
        select: {
          id: true,
          status: true,
          studentId: true,
          tutorId: true,
          parent: {
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
          } satisfies HomeworkActionResult
        };
      }

      if (lesson.status === "CANCELLED") {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Homework cannot be assigned to a cancelled lesson."
          } satisfies HomeworkActionResult
        };
      }

      const homework = await tx.homework.create({
        data: {
          lessonId: lesson.id,
          studentId: lesson.studentId,
          tutorId: lesson.tutorId,
          title: parsed.data.title.trim(),
          description: parsed.data.description.trim(),
          dueDate: parsed.data.dueDate ?? null,
          status: "ASSIGNED"
        },
        select: {
          id: true
        }
      });

      await tx.notification.create({
        data: {
          userId: lesson.parent.userId,
          type: "HOMEWORK_ASSIGNED",
          title: "Homework has been assigned.",
          message:
            "Your child has new homework from a TopMox lesson. Review it in the lesson details.",
          href: `/parent/lessons/${lesson.id}`
        }
      });

      return {
        kind: "success" as const,
        homework
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Homework assigned.",
      data: {
        homeworkId: result.homework.id
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
