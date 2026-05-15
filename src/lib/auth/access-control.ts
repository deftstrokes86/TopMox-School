import { db } from "@/lib/db";
import {
  canAccessAssessmentWithClient,
  canAccessEnrollmentWithClient,
  canAccessLessonWithClient,
  canAccessPaymentWithClient,
  canAccessStudentWithClient
} from "./access-control-core";
import type { AppRole } from "./types";

export async function canAccessStudent(
  userId: string,
  role: AppRole,
  studentId: string
): Promise<boolean> {
  return canAccessStudentWithClient(db, userId, role, studentId);
}

export async function canAccessLesson(
  userId: string,
  role: AppRole,
  lessonId: string
): Promise<boolean> {
  return canAccessLessonWithClient(db, userId, role, lessonId);
}

export async function canAccessReport(
  userId: string,
  role: AppRole,
  reportId: string
): Promise<boolean> {
  if (!userId || !reportId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  const report = await db.progressReport.findFirst({
    where: {
      id: reportId,
      OR:
        role === "PARENT"
          ? [{ parent: { userId }, status: "PUBLISHED" }]
          : role === "TUTOR"
            ? [{ tutor: { userId } }]
            : []
    },
    select: { id: true }
  });

  return Boolean(report);
}

export async function canAccessPayment(
  userId: string,
  role: AppRole,
  paymentId: string
): Promise<boolean> {
  return canAccessPaymentWithClient(db, userId, role, paymentId);
}

export async function canAccessAssessment(
  userId: string,
  role: AppRole,
  assessmentId: string
): Promise<boolean> {
  return canAccessAssessmentWithClient(db, userId, role, assessmentId);
}

export async function canAccessEnrollment(
  userId: string,
  role: AppRole,
  enrollmentId: string
): Promise<boolean> {
  return canAccessEnrollmentWithClient(db, userId, role, enrollmentId);
}
