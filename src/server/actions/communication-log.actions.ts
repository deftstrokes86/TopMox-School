"use server";

import { AuthError, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createCommunicationLogSchema,
  type CreateCommunicationLogInput
} from "@/lib/validations/communication-log.schema";
import {
  CommunicationLogAccessError,
  assertCanCreateCommunicationLog,
  createCommunicationLog
} from "@/server/services/communication-log.service";

type CommunicationLogFieldErrors = Partial<
  Record<keyof CreateCommunicationLogInput, string>
>;

export type CommunicationLogActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: CommunicationLogFieldErrors;
  data?: {
    communicationLogId: string;
  };
};

function toAuthErrorResult(error: unknown) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : "Only admins can create communication logs."
    } satisfies CommunicationLogActionResult;
  }

  return null;
}

function createCommunicationLogFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): CommunicationLogFieldErrors {
  return {
    type: fieldErrors.type?.[0],
    message: fieldErrors.message?.[0],
    parentId: fieldErrors.parentId?.[0],
    studentId: fieldErrors.studentId?.[0],
    assessmentRequestId: fieldErrors.assessmentRequestId?.[0],
    lessonId: fieldErrors.lessonId?.[0],
    paymentId: fieldErrors.paymentId?.[0],
    supportRequestId: fieldErrors.supportRequestId?.[0]
  };
}

export async function createCommunicationLogAction(
  payload: CreateCommunicationLogInput
): Promise<CommunicationLogActionResult> {
  try {
    const parsed = createCommunicationLogSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the communication log fields and try again.",
        fieldErrors: createCommunicationLogFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireAdmin();
    assertCanCreateCommunicationLog(user.role);

    const log = await createCommunicationLog(db, {
      ...parsed.data,
      createdById: user.id
    });

    return {
      success: true,
      message: "Communication log created.",
      data: {
        communicationLogId: log.id
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    if (error instanceof CommunicationLogAccessError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }
}
