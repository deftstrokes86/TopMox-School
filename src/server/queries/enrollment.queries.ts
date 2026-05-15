import type { EnrollmentStatus, Prisma } from "@prisma/client";

import { requireAdmin, requireParent } from "@/lib/auth";
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
  parent: {
    select: {
      id: true,
      whatsappNumber: true,
      country: true,
      timezone: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  },
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
  },
  payments: {
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      amount: true,
      currency: true,
      checkoutUrl: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1
  }
} satisfies Prisma.EnrollmentSelect;

export type AdminEnrollmentFilters = {
  status?: EnrollmentStatus;
  needsTutorAssignment?: boolean;
  take?: number;
};

export function buildAdminEnrollmentWhereInput(
  filters: AdminEnrollmentFilters = {}
): Prisma.EnrollmentWhereInput {
  const where: Prisma.EnrollmentWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.needsTutorAssignment) {
    where.status = "ACTIVE";
    where.assignedTutorId = null;
  }

  return where;
}

export async function getAdminEnrollments(
  filters: AdminEnrollmentFilters = {}
) {
  await requireAdmin();

  return db.enrollment.findMany({
    where: buildAdminEnrollmentWhereInput(filters),
    select: enrollmentSelect,
    orderBy: {
      createdAt: "desc"
    },
    take: filters.take
  });
}

export async function getAdminEnrollmentById(enrollmentId: string) {
  await requireAdmin();

  return db.enrollment.findUnique({
    where: {
      id: enrollmentId
    },
    select: enrollmentSelect
  });
}

export async function getAdminEnrollmentSummary() {
  await requireAdmin();

  const [active, needsTutorAssignment] = await Promise.all([
    db.enrollment.count({
      where: {
        status: "ACTIVE"
      }
    }),
    db.enrollment.count({
      where: buildAdminEnrollmentWhereInput({
        needsTutorAssignment: true
      })
    })
  ]);

  return {
    active,
    needsTutorAssignment
  };
}

export async function getActiveEnrollmentsForLessonScheduling() {
  await requireAdmin();

  return db.enrollment.findMany({
    where: {
      status: "ACTIVE"
    },
    select: enrollmentSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}

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

export async function getCurrentParentPendingPaymentEnrollments() {
  const user = await requireParent();

  return db.enrollment.findMany({
    where: {
      parent: {
        userId: user.id
      },
      status: "PENDING_PAYMENT",
      payments: {
        none: {
          status: {
            in: ["PENDING", "AWAITING_VERIFICATION", "PAID"]
          }
        }
      }
    },
    select: enrollmentSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}
