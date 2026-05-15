import type { Prisma, SupportStatus } from "@prisma/client";

import { requireAdmin, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";

const supportRequestSelect = {
  id: true,
  parentId: true,
  studentId: true,
  lessonId: true,
  paymentId: true,
  assessmentRequestId: true,
  subject: true,
  message: true,
  adminReply: true,
  status: true,
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
      classYearGroup: true,
      curriculum: true
    }
  },
  lesson: {
    select: {
      id: true,
      title: true,
      startTime: true,
      status: true
    }
  },
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true
    }
  },
  assessmentRequest: {
    select: {
      id: true,
      status: true,
      academicConcern: true
    }
  }
} satisfies Prisma.SupportRequestSelect;

export type SupportRequestQueryResult = Prisma.SupportRequestGetPayload<{
  select: typeof supportRequestSelect;
}>;

export type AdminSupportRequestFilters = {
  status?: SupportStatus;
  parentId?: string;
  studentId?: string;
  search?: string;
  take?: number;
};

export function buildParentSupportRequestWhereInput(
  userId: string,
  supportRequestId?: string
): Prisma.SupportRequestWhereInput {
  return {
    ...(supportRequestId ? { id: supportRequestId } : {}),
    parent: {
      userId
    }
  };
}

export function buildAdminSupportRequestWhereInput(
  filters: AdminSupportRequestFilters = {}
): Prisma.SupportRequestWhereInput {
  const where: Prisma.SupportRequestWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.parentId) {
    where.parentId = filters.parentId;
  }

  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      {
        subject: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        message: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        parent: {
          user: {
            name: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      },
      {
        parent: {
          user: {
            email: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      },
      {
        student: {
          fullName: {
            contains: query,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  return where;
}

export async function getCurrentParentSupportRequests() {
  const user = await requireParent();

  return db.supportRequest.findMany({
    where: buildParentSupportRequestWhereInput(user.id),
    select: supportRequestSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getCurrentParentSupportRequestById(
  supportRequestId: string
) {
  const user = await requireParent();

  return db.supportRequest.findFirst({
    where: buildParentSupportRequestWhereInput(user.id, supportRequestId),
    select: supportRequestSelect
  });
}

export async function getAdminSupportRequests(
  filters: AdminSupportRequestFilters = {}
) {
  await requireAdmin();

  return db.supportRequest.findMany({
    where: buildAdminSupportRequestWhereInput(filters),
    select: supportRequestSelect,
    orderBy: {
      createdAt: "desc"
    },
    take: filters.take
  });
}

export async function getAdminSupportRequestById(supportRequestId: string) {
  await requireAdmin();

  return db.supportRequest.findUnique({
    where: {
      id: supportRequestId
    },
    select: supportRequestSelect
  });
}
