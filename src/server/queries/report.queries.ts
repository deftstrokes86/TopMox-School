import type { Prisma, ReportStatus } from "@prisma/client";

import { requireAdmin, requireParent, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";
import { shapeParentFacingReport } from "@/server/services/report.service";

const reportSelect = {
  id: true,
  parentId: true,
  studentId: true,
  tutorId: true,
  enrollmentId: true,
  reportingMonth: true,
  subjectsCovered: true,
  attendanceSummary: true,
  strengths: true,
  areasNeedingImprovement: true,
  homeworkCompletion: true,
  tutorComments: true,
  recommendedNextSteps: true,
  parentActionPoints: true,
  overallProgressStatus: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
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
      countryOfStudy: true,
      curriculum: true
    }
  },
  tutor: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  },
  enrollment: {
    select: {
      id: true,
      status: true,
      tutoringPlan: {
        select: {
          name: true,
          sessionsPerWeek: true
        }
      }
    }
  }
} satisfies Prisma.ProgressReportSelect;

export type ProgressReportQueryResult = Prisma.ProgressReportGetPayload<{
  select: typeof reportSelect;
}>;

export type AdminReportFilters = {
  status?: ReportStatus;
  tutorId?: string;
  studentId?: string;
  parentId?: string;
  reportingMonth?: Date;
  take?: number;
};

export function buildParentReportWhereInput(
  userId: string,
  reportId?: string
): Prisma.ProgressReportWhereInput {
  return {
    ...(reportId ? { id: reportId } : {}),
    parent: {
      userId
    },
    status: "PUBLISHED"
  };
}

export function buildTutorReportWhereInput(
  userId: string,
  reportId?: string
): Prisma.ProgressReportWhereInput {
  return {
    ...(reportId ? { id: reportId } : {}),
    tutor: {
      userId
    }
  };
}

export function buildAdminReportWhereInput(
  filters: AdminReportFilters = {}
): Prisma.ProgressReportWhereInput {
  const where: Prisma.ProgressReportWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.tutorId) {
    where.tutorId = filters.tutorId;
  }

  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.parentId) {
    where.parentId = filters.parentId;
  }

  if (filters.reportingMonth) {
    where.reportingMonth = filters.reportingMonth;
  }

  return where;
}

function getCurrentMonthRange(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { start, end };
}

export async function getCurrentTutorReports() {
  const user = await requireTutor();

  return db.progressReport.findMany({
    where: buildTutorReportWhereInput(user.id),
    select: reportSelect,
    orderBy: {
      reportingMonth: "desc"
    }
  });
}

export async function getCurrentTutorReportById(reportId: string) {
  const user = await requireTutor();

  return db.progressReport.findFirst({
    where: buildTutorReportWhereInput(user.id, reportId),
    select: reportSelect
  });
}

export async function getCurrentParentReports() {
  const user = await requireParent();

  const reports = await db.progressReport.findMany({
    where: buildParentReportWhereInput(user.id),
    select: reportSelect,
    orderBy: {
      reportingMonth: "desc"
    }
  });

  return reports.map(shapeParentFacingReport);
}

export async function getCurrentParentReportById(reportId: string) {
  const user = await requireParent();

  const report = await db.progressReport.findFirst({
    where: buildParentReportWhereInput(user.id, reportId),
    select: reportSelect
  });

  return report ? shapeParentFacingReport(report) : null;
}

export async function getAdminReports(filters: AdminReportFilters = {}) {
  await requireAdmin();

  return db.progressReport.findMany({
    where: buildAdminReportWhereInput(filters),
    select: reportSelect,
    orderBy: [
      {
        status: "asc"
      },
      {
        reportingMonth: "desc"
      }
    ],
    take: filters.take
  });
}

export async function getAdminReportById(reportId: string) {
  await requireAdmin();

  return db.progressReport.findUnique({
    where: {
      id: reportId
    },
    select: reportSelect
  });
}

export async function getReportsDueForAdmin(now = new Date()) {
  await requireAdmin();
  const { start, end } = getCurrentMonthRange(now);

  return db.enrollment.findMany({
    where: {
      status: "ACTIVE",
      assignedTutorId: {
        not: null
      },
      progressReports: {
        none: {
          reportingMonth: {
            gte: start,
            lt: end
          }
        }
      }
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          fullName: true
        }
      },
      parent: {
        select: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
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
      tutoringPlan: {
        select: {
          name: true
        }
      }
    }
  });
}

export async function getReportsDueForTutor(now = new Date()) {
  const user = await requireTutor();
  const { start, end } = getCurrentMonthRange(now);

  return db.enrollment.findMany({
    where: {
      status: "ACTIVE",
      assignedTutor: {
        userId: user.id
      },
      progressReports: {
        none: {
          reportingMonth: {
            gte: start,
            lt: end
          }
        }
      }
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          fullName: true,
          classYearGroup: true
        }
      },
      tutoringPlan: {
        select: {
          name: true
        }
      }
    }
  });
}
