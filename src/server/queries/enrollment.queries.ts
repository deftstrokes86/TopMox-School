import type { Prisma } from "@prisma/client";

import { requireParent } from "@/lib/auth";
import { db } from "@/lib/db";

const enrollmentSelect = {
  id: true,
  parentId: true,
  studentId: true,
  tutoringPlanId: true,
  assignedTutorId: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      curriculum: true
    }
  },
  tutoringPlan: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      monthlyPrice: true,
      currency: true,
      sessionsPerWeek: true,
      bestFor: true,
      features: true
    }
  },
  assignedTutor: {
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  }
} satisfies Prisma.EnrollmentSelect;

export async function getCurrentParentEnrollments() {
  const user = await requireParent();

  return db.enrollment.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: enrollmentSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getEnrollmentForCurrentParent(enrollmentId: string) {
  const user = await requireParent();

  return db.enrollment.findFirst({
    where: {
      id: enrollmentId,
      parent: {
        userId: user.id
      }
    },
    select: enrollmentSelect
  });
}

export async function getEnrollmentByAssessmentForCurrentParent(
  assessmentRequestId: string
) {
  const user = await requireParent();

  const assessment = await db.assessmentRequest.findFirst({
    where: {
      id: assessmentRequestId,
      parent: {
        userId: user.id
      }
    },
    select: {
      parentId: true,
      studentId: true,
      outcome: {
        select: {
          recommendedPlanId: true
        }
      }
    }
  });

  if (!assessment?.outcome?.recommendedPlanId) {
    return null;
  }

  return db.enrollment.findFirst({
    where: {
      parentId: assessment.parentId,
      studentId: assessment.studentId,
      tutoringPlanId: assessment.outcome.recommendedPlanId,
      status: {
        not: "CANCELLED"
      }
    },
    select: enrollmentSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}
