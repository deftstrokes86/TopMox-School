import type { EnrollmentStatus, LessonStatus } from "@prisma/client";

export type AdminLessonStatusAction = {
  status: LessonStatus;
  label: string;
  destructive?: boolean;
};

const ADMIN_LESSON_STATUS_ACTIONS: Partial<
  Record<LessonStatus, AdminLessonStatusAction[]>
> = {
  SCHEDULED: [
    { status: "RESCHEDULED", label: "Mark Rescheduled" },
    { status: "CANCELLED", label: "Cancel Lesson", destructive: true },
    { status: "MISSED", label: "Mark Missed" },
    { status: "COMPLETED", label: "Mark Completed" }
  ],
  RESCHEDULED: [
    { status: "SCHEDULED", label: "Confirm Scheduled" },
    { status: "CANCELLED", label: "Cancel Lesson", destructive: true }
  ]
};

export function canScheduleLessonsForEnrollment(
  status: EnrollmentStatus
): boolean {
  return status === "ACTIVE";
}

export function getLessonSchedulingUnavailableMessage(
  status: EnrollmentStatus
): string {
  if (status === "PENDING_PAYMENT") {
    return "Lesson scheduling becomes available after payment activation.";
  }

  if (status === "PAUSED") {
    return "Lesson scheduling becomes available when the enrollment is active again.";
  }

  if (status === "CANCELLED") {
    return "Lesson scheduling is unavailable because this enrollment is cancelled.";
  }

  if (status === "COMPLETED") {
    return "Lesson scheduling is unavailable because this enrollment is completed.";
  }

  return "Lesson scheduling is unavailable for this enrollment state.";
}

export function getAdminLessonStatusActions(
  status: LessonStatus
): AdminLessonStatusAction[] {
  return ADMIN_LESSON_STATUS_ACTIONS[status] ?? [];
}
