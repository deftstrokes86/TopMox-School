import { db } from "@/lib/db";
import {
  canAccessAssessmentWithClient,
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
  if (!userId || !lessonId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      OR:
        role === "PARENT"
          ? [{ parent: { userId } }]
          : role === "TUTOR"
            ? [{ tutor: { userId } }]
            : []
    },
    select: { id: true }
  });

  return Boolean(lesson);
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
  if (!userId || !paymentId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  if (role !== "PARENT") {
    return false;
  }

  const payment = await db.payment.findFirst({
    where: {
      id: paymentId,
      parent: {
        userId
      }
    },
    select: { id: true }
  });

  return Boolean(payment);
}

export async function canAccessAssessment(
  userId: string,
  role: AppRole,
  assessmentId: string
): Promise<boolean> {
  return canAccessAssessmentWithClient(db, userId, role, assessmentId);
}
