"use server";

import { AuthError, requireAuth } from "@/lib/auth";
import {
  markNotificationReadSchema,
  type MarkNotificationReadInput
} from "@/lib/validations/notification.schema";
import {
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/services/notification.service";

type NotificationFieldErrors = Partial<
  Record<keyof MarkNotificationReadInput, string>
>;

export type NotificationActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: NotificationFieldErrors;
  data?: {
    count?: number;
  };
};

function toAuthErrorResult(error: unknown): NotificationActionResult | null {
  if (!(error instanceof AuthError)) {
    return null;
  }

  return {
    success: false,
    message:
      error.code === "UNAUTHENTICATED"
        ? "Authentication required."
        : "You do not have permission to update this notification."
  };
}

export async function markNotificationReadAction(
  payload: MarkNotificationReadInput
): Promise<NotificationActionResult> {
  try {
    const parsed = markNotificationReadSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid notification.",
        fieldErrors: {
          notificationId:
            parsed.error.flatten().fieldErrors.notificationId?.[0]
        }
      };
    }

    const user = await requireAuth();
    const result = await markNotificationRead({
      userId: user.id,
      notificationId: parsed.data.notificationId
    });

    return result;
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function markAllNotificationsReadAction(): Promise<
  NotificationActionResult
> {
  try {
    const user = await requireAuth();
    const result = await markAllNotificationsRead(user.id);

    return {
      success: true,
      message: "All notifications marked as read.",
      data: {
        count: result.count
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

export async function markNotificationReadFromFormAction(formData: FormData) {
  await markNotificationReadAction({
    notificationId: String(formData.get("notificationId") ?? "")
  });
}

export async function markAllNotificationsReadFromFormAction() {
  await markAllNotificationsReadAction();
}
