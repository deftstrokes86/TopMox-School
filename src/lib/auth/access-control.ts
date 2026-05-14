import type { AppRole } from "./types";

import { db } from "@/lib/db";

type AccessCheckInput = {
  userId: string;
  role: AppRole;
};

/**
 * Phase 3A foundational authorization helper.
 * Final ownership and assignment rules will be tightened in Phase 3B+.
 */
export async function canAccessStudent(
  userId: string,
  role: AppRole,
  studentId: string
): Promise<boolean> {
  if (!userId || !studentId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  if (role === "PARENT") {
    const student = await db.studentProfile.findFirst({
      where: {
        id: studentId,
        parent: {
          userId
        }
      },
      select: { id: true }
    });

    return Boolean(student);
  }

  if (role === "TUTOR") {
    const lesson = await db.lesson.findFirst({
      where: {
        studentId,
        tutor: {
          userId
        }
      },
      select: { id: true }
    });

    return Boolean(lesson);
  }

  return false;
}

/**
 * Phase 3A foundational authorization helper.
 * Final ownership and assignment rules will be tightened in Phase 3B+.
 */
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

/**
 * Phase 3A foundational authorization helper.
 * Final ownership and assignment rules will be tightened in Phase 3B+.
 */
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

/**
 * Phase 3A foundational authorization helper.
 * Final ownership and assignment rules will be tightened in Phase 3B+.
 */
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

/**
 * Phase 3A foundational authorization helper.
 * Final ownership and assignment rules will be tightened in Phase 3B+.
 */
export async function canAccessAssessment(
  userId: string,
  role: AppRole,
  assessmentId: string
): Promise<boolean> {
  if (!userId || !assessmentId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  if (role !== "PARENT") {
    return false;
  }

  const assessment = await db.assessmentRequest.findFirst({
    where: {
      id: assessmentId,
      parent: {
        userId
      }
    },
    select: { id: true }
  });

  return Boolean(assessment);
}

export function normalizeAccessCheckInput(input: AccessCheckInput): AccessCheckInput {
  return input;
}
