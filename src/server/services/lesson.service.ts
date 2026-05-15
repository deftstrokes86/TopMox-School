import type { EnrollmentStatus, LessonStatus, Role, TutorStatus } from "@prisma/client";

import type { CreateLessonInput } from "@/lib/validations/lesson.schema";
import { assertTutorCanBeAssigned } from "@/server/services/tutor-assignment.service";

export class LessonStatusTransitionError extends Error {
  constructor(currentStatus: LessonStatus, nextStatus: LessonStatus) {
    super(`Cannot transition lesson from ${currentStatus} to ${nextStatus}.`);
    this.name = "LessonStatusTransitionError";
  }
}

export class LessonSchedulingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonSchedulingError";
  }
}

export const LESSON_STATUS_TRANSITIONS: Record<LessonStatus, LessonStatus[]> = {
  SCHEDULED: ["COMPLETED", "MISSED", "RESCHEDULED", "CANCELLED"],
  RESCHEDULED: ["SCHEDULED", "CANCELLED"],
  COMPLETED: [],
  MISSED: [],
  CANCELLED: []
};

export function canTransitionLessonStatus(
  currentStatus: LessonStatus,
  nextStatus: LessonStatus
): boolean {
  return LESSON_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertLessonStatusTransition(
  currentStatus: LessonStatus,
  nextStatus: LessonStatus
): void {
  if (!canTransitionLessonStatus(currentStatus, nextStatus)) {
    throw new LessonStatusTransitionError(currentStatus, nextStatus);
  }
}

export function assertEnrollmentCanReceiveLessons(
  enrollmentStatus: EnrollmentStatus
): void {
  if (enrollmentStatus !== "ACTIVE") {
    throw new LessonSchedulingError(
      "Enrollment must be active before scheduling lessons."
    );
  }
}

export function assertLessonTimeIsValid(startTime: Date, endTime: Date): void {
  if (endTime <= startTime) {
    throw new LessonSchedulingError("End time must be after start time.");
  }
}

export type LessonSchedulingInput = {
  currentRole: Role;
  enrollmentStatus: EnrollmentStatus;
  enrollmentParentId: string;
  enrollmentStudentId: string;
  requestedStudentId: string;
  assignedTutorId?: string | null;
  requestedTutorId: string;
  tutorExists: boolean;
  tutorStatus?: TutorStatus | null;
  subjectExists: boolean;
};

export type LessonSchedulingResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof CreateLessonInput, string>>;
    };

export function validateLessonScheduling({
  currentRole,
  enrollmentStatus,
  enrollmentStudentId,
  requestedStudentId,
  requestedTutorId,
  tutorExists,
  tutorStatus,
  subjectExists
}: LessonSchedulingInput): LessonSchedulingResult {
  if (currentRole !== "ADMIN") {
    return {
      success: false,
      message: "Only admins can schedule lessons.",
      fieldErrors: {
        enrollmentId: "Only admins can schedule lessons."
      }
    };
  }

  try {
    assertEnrollmentCanReceiveLessons(enrollmentStatus);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Enrollment must be active before scheduling lessons.",
      fieldErrors: {
        enrollmentId: "Enrollment must be active before scheduling lessons."
      }
    };
  }

  if (enrollmentStudentId !== requestedStudentId) {
    return {
      success: false,
      message: "Student must belong to the selected enrollment.",
      fieldErrors: {
        studentId: "Student must belong to the selected enrollment."
      }
    };
  }

  try {
    assertTutorCanBeAssigned({
      tutorExists,
      tutorUserRole: "TUTOR",
      tutorStatus
    });
  } catch {
    return {
      success: false,
      message: "Choose an active tutor.",
      fieldErrors: {
        tutorId: "Choose an active tutor."
      }
    };
  }

  if (!requestedTutorId) {
    return {
      success: false,
      message: "Choose an active tutor.",
      fieldErrors: {
        tutorId: "Choose an active tutor."
      }
    };
  }

  if (!subjectExists) {
    return {
      success: false,
      message: "Choose a supported subject.",
      fieldErrors: {
        subjectId: "Choose a supported subject."
      }
    };
  }

  return { success: true };
}

export function getLessonScheduledNotificationPayloads(lessonId: string) {
  return {
    parent: {
      type: "LESSON_SCHEDULED" as const,
      title: "A lesson has been scheduled.",
      message:
        "TopMox has scheduled a lesson for your child. Review the lesson details in your parent dashboard.",
      href: `/parent/lessons/${lessonId}`
    },
    tutor: {
      type: "LESSON_SCHEDULED" as const,
      title: "A new lesson has been assigned to you.",
      message:
        "TopMox has scheduled a lesson for one of your assigned students.",
      href: `/tutor/lessons/${lessonId}`
    }
  };
}

export function getLessonStatusNotificationPayload(
  lessonId: string,
  status: LessonStatus
) {
  if (status === "RESCHEDULED") {
    return {
      type: "LESSON_RESCHEDULED" as const,
      title: "A lesson has been rescheduled.",
      message: "A TopMox lesson has been rescheduled. Review the updated status.",
      href: `/parent/lessons/${lessonId}`
    };
  }

  if (status === "CANCELLED") {
    return {
      type: "LESSON_CANCELLED" as const,
      title: "A lesson has been cancelled.",
      message: "A TopMox lesson has been cancelled. Contact TopMox if you need help.",
      href: `/parent/lessons/${lessonId}`
    };
  }

  if (status === "COMPLETED") {
    return {
      type: "LESSON_COMPLETED" as const,
      title: "A lesson has been completed.",
      message: "A TopMox lesson has been marked completed.",
      href: `/parent/lessons/${lessonId}`
    };
  }

  return null;
}
