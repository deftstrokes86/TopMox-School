import type { AssessmentStatus, Prisma } from "@prisma/client";

import { requireAdmin, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import { ASSESSMENT_STATUSES } from "@/lib/validations/assessment.schema";

const assessmentRequestSelect = {
  id: true,
  parentId: true,
  studentId: true,
  status: true,
  academicConcern: true,
  preferredAssessmentDate: true,
  preferredAssessmentTime: true,
  timezone: true,
  notes: true,
  scheduledAt: true,
  meetingLink: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      whatsappNumber: true,
      country: true,
      timezone: true,
      preferredContactMethod: true,
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
      countryOfStudy: true,
      curriculum: true,
      mainAcademicChallenge: true,
      academicGoal: true
    }
  },
  subjects: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  outcome: {
    select: {
      id: true,
      recommendedPlanId: true,
      parentFacingSummary: true,
      recommendedPlan: {
        select: {
          id: true,
          name: true,
          sessionsPerWeek: true
        }
      }
    }
  },
  communicationLogs: {
    select: {
      id: true,
      type: true,
      message: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  }
} satisfies Prisma.AssessmentRequestSelect;

export const assessmentOutcomeAdminSelect = {
  id: true,
  assessmentRequestId: true,
  recommendedPlanId: true,
  academicLevelSummary: true,
  strengths: true,
  weakAreas: true,
  recommendedSubjects: true,
  recommendedWeeklyLessonCount: true,
  parentFacingSummary: true,
  internalAdminNotes: true,
  createdAt: true,
  updatedAt: true,
  recommendedPlan: {
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
  }
} satisfies Prisma.AssessmentOutcomeSelect;

export const assessmentOutcomeParentSelect = {
  id: true,
  assessmentRequestId: true,
  recommendedPlanId: true,
  academicLevelSummary: true,
  strengths: true,
  weakAreas: true,
  recommendedSubjects: true,
  recommendedWeeklyLessonCount: true,
  parentFacingSummary: true,
  createdAt: true,
  updatedAt: true,
  recommendedPlan: {
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
  }
} satisfies Prisma.AssessmentOutcomeSelect;

export type AssessmentRequestListFilters = {
  status?: AssessmentStatus;
  parentName?: string;
  studentName?: string;
  subjectSlug?: string;
  take?: number;
};

export function buildAdminAssessmentWhereInput(
  filters: AssessmentRequestListFilters = {}
): Prisma.AssessmentRequestWhereInput {
  const where: Prisma.AssessmentRequestWhereInput = {};
  const andFilters: Prisma.AssessmentRequestWhereInput[] = [];

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.parentName?.trim()) {
    andFilters.push({
      parent: {
        user: {
          name: {
            contains: filters.parentName.trim(),
            mode: "insensitive"
          }
        }
      }
    });
  }

  if (filters.studentName?.trim()) {
    andFilters.push({
      student: {
        fullName: {
          contains: filters.studentName.trim(),
          mode: "insensitive"
        }
      }
    });
  }

  if (filters.subjectSlug?.trim()) {
    andFilters.push({
      subjects: {
        some: {
          slug: filters.subjectSlug.trim()
        }
      }
    });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  return where;
}

export async function getCurrentParentAssessmentRequests() {
  const user = await requireParent();

  return db.assessmentRequest.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: assessmentRequestSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getAssessmentRequestForCurrentParent(
  assessmentId: string
) {
  const user = await requireParent();

  return db.assessmentRequest.findFirst({
    where: {
      id: assessmentId,
      parent: {
        userId: user.id
      }
    },
    select: assessmentRequestSelect
  });
}

export async function getAssessmentEligibleChildrenForCurrentParent() {
  const user = await requireParent();

  return db.studentProfile.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      curriculum: true,
      subjects: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getAdminAssessmentRequests(
  filters: AssessmentRequestListFilters = {}
) {
  await requireAdmin();

  return db.assessmentRequest.findMany({
    where: buildAdminAssessmentWhereInput(filters),
    select: assessmentRequestSelect,
    orderBy: {
      createdAt: "desc"
    },
    take: filters.take
  });
}

export async function getAdminAssessmentRequestById(assessmentId: string) {
  await requireAdmin();

  return db.assessmentRequest.findUnique({
    where: {
      id: assessmentId
    },
    select: assessmentRequestSelect
  });
}

export async function getAssessmentRequestCountsByStatus() {
  await requireAdmin();

  const groupedCounts = await db.assessmentRequest.groupBy({
    by: ["status"],
    _count: {
      status: true
    }
  });

  const counts = Object.fromEntries(
    ASSESSMENT_STATUSES.map((status) => [status, 0])
  ) as Record<AssessmentStatus, number>;

  for (const item of groupedCounts) {
    counts[item.status] = item._count.status;
  }

  return counts;
}

export async function getAssessmentOutcomeForAdmin(assessmentId: string) {
  await requireAdmin();

  return db.assessmentOutcome.findUnique({
    where: {
      assessmentRequestId: assessmentId
    },
    select: assessmentOutcomeAdminSelect
  });
}

export async function getAssessmentOutcomeForCurrentParent(
  assessmentId: string
) {
  const user = await requireParent();

  return db.assessmentOutcome.findFirst({
    where: {
      assessmentRequestId: assessmentId,
      assessmentRequest: {
        status: "PLAN_RECOMMENDED",
        parent: {
          userId: user.id
        }
      }
    },
    select: assessmentOutcomeParentSelect
  });
}

export async function getRecommendedPlanForCurrentParent(assessmentId: string) {
  const outcome = await getAssessmentOutcomeForCurrentParent(assessmentId);

  return outcome?.recommendedPlan ?? null;
}

export async function getActiveTutoringPlansForAdmin() {
  await requireAdmin();

  return db.tutoringPlan.findMany({
    where: {
      isActive: true
    },
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
    },
    orderBy: [
      {
        sessionsPerWeek: "asc"
      },
      {
        name: "asc"
      }
    ]
  });
}
