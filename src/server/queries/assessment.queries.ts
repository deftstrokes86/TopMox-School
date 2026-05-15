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
      recommendedPlanId: true
    }
  }
} satisfies Prisma.AssessmentRequestSelect;

export type AssessmentRequestListFilters = {
  status?: AssessmentStatus;
};

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
    where: {
      status: filters.status
    },
    select: assessmentRequestSelect,
    orderBy: {
      createdAt: "desc"
    }
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
