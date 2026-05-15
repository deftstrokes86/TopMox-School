import type { EnrollmentStatus, Role, TutorStatus } from "@prisma/client";

import type { AssignTutorToEnrollmentInput } from "@/lib/validations/tutor.schema";

export class TutorAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TutorAssignmentError";
  }
}

export type TutorAssignmentInput = {
  currentRole: Role;
  enrollmentStatus: EnrollmentStatus;
  tutorExists: boolean;
  tutorUserRole?: Role | null;
  tutorStatus?: TutorStatus | null;
};

export type TutorAssignmentResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof AssignTutorToEnrollmentInput, string>>;
    };

export function assertTutorCanBeAssigned({
  tutorExists,
  tutorUserRole,
  tutorStatus
}: Pick<
  TutorAssignmentInput,
  "tutorExists" | "tutorUserRole" | "tutorStatus"
>): void {
  if (!tutorExists || tutorUserRole !== "TUTOR" || tutorStatus !== "ACTIVE") {
    throw new TutorAssignmentError("Choose an active tutor.");
  }
}

export function validateTutorAssignment({
  currentRole,
  enrollmentStatus,
  tutorExists,
  tutorUserRole,
  tutorStatus
}: TutorAssignmentInput): TutorAssignmentResult {
  if (currentRole !== "ADMIN") {
    return {
      success: false,
      message: "Only admins can assign tutors.",
      fieldErrors: {
        enrollmentId: "Only admins can assign tutors."
      }
    };
  }

  if (enrollmentStatus !== "ACTIVE") {
    return {
      success: false,
      message: "Enrollment must be active before assigning a tutor.",
      fieldErrors: {
        enrollmentId: "Enrollment must be active before assigning a tutor."
      }
    };
  }

  try {
    assertTutorCanBeAssigned({
      tutorExists,
      tutorUserRole,
      tutorStatus
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Choose an active tutor.",
      fieldErrors: {
        tutorId: "Choose an active tutor."
      }
    };
  }

  return { success: true };
}

export function getParentTutorAssignedNotificationPayload(enrollmentId: string) {
  return {
    type: "TUTOR_ASSIGNED" as const,
    title: "A tutor has been assigned to your child.",
    message:
      "TopMox has assigned a tutor to your child's active tutoring plan.",
    href: `/parent/enrollments?enrollmentId=${enrollmentId}`
  };
}

export function getTutorAssignedNotificationPayload(enrollmentId: string) {
  return {
    type: "TUTOR_ASSIGNED" as const,
    title: "You have been assigned to a student.",
    message:
      "TopMox has assigned you to an active student enrollment. Lessons will appear once scheduled.",
    href: `/tutor/students?enrollmentId=${enrollmentId}`
  };
}
