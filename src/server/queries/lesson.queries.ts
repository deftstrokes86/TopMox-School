import type { LessonStatus, Prisma } from "@prisma/client";

import { requireAdmin, requireParent, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

const lessonSelect = {
  id: true,
  parentId: true,
  studentId: true,
  tutorId: true,
  subjectId: true,
  enrollmentId: true,
  title: true,
  startTime: true,
  endTime: true,
  timezone: true,
  meetingLink: true,
  status: true,
  attendanceMarkedAt: true,
  attended: true,
  lessonNotes: true,
  concernFlag: true,
  concernNote: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      userId: true,
      country: true,
      timezone: true,
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
      age: true,
      classYearGroup: true,
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
  subject: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  enrollment: {
    select: {
      id: true,
      status: true,
      tutoringPlan: {
        select: {
          id: true,
          name: true,
          sessionsPerWeek: true
        }
      }
    }
  }
} satisfies Prisma.LessonSelect;

export type AdminLessonFilters = {
  status?: LessonStatus;
  tutorId?: string;
  studentId?: string;
  subjectId?: string;
  take?: number;
};

export function buildAdminLessonWhereInput(
  filters: AdminLessonFilters = {}
): Prisma.LessonWhereInput {
  const where: Prisma.LessonWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.tutorId) {
    where.tutorId = filters.tutorId;
  }

  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }

  return where;
}

export async function getAdminLessons(filters: AdminLessonFilters = {}) {
  await requireAdmin();

  return db.lesson.findMany({
    where: buildAdminLessonWhereInput(filters),
    select: lessonSelect,
    orderBy: {
      startTime: "asc"
    },
    take: filters.take
  });
}

export async function getAdminLessonById(lessonId: string) {
  await requireAdmin();

  return db.lesson.findUnique({
    where: {
      id: lessonId
    },
    select: lessonSelect
  });
}

export async function getCurrentParentLessons() {
  const user = await requireParent();

  return db.lesson.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: lessonSelect,
    orderBy: {
      startTime: "asc"
    }
  });
}

export async function getCurrentParentLessonById(lessonId: string) {
  const user = await requireParent();

  return db.lesson.findFirst({
    where: {
      id: lessonId,
      parent: {
        userId: user.id
      }
    },
    select: lessonSelect
  });
}

export async function getCurrentTutorLessons() {
  const user = await requireTutor();

  return db.lesson.findMany({
    where: {
      tutor: {
        userId: user.id
      }
    },
    select: lessonSelect,
    orderBy: {
      startTime: "asc"
    }
  });
}

export async function getCurrentTutorLessonById(lessonId: string) {
  const user = await requireTutor();

  return db.lesson.findFirst({
    where: {
      id: lessonId,
      tutor: {
        userId: user.id
      }
    },
    select: lessonSelect
  });
}
