import type {
  EnrollmentStatus,
  HomeworkStatus,
  LessonStatus,
  Prisma
} from "@prisma/client";

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
      countryOfStudy: true,
      curriculum: true,
      mainAcademicChallenge: true,
      academicGoal: true
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
  },
  homework: {
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.LessonSelect;

export type LessonQueryResult = Prisma.LessonGetPayload<{
  select: typeof lessonSelect;
}>;

type LessonDetailViewSource = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  meetingLink: string | null;
  status: LessonStatus;
  attendanceMarkedAt: Date | null;
  attended: boolean | null;
  lessonNotes: string | null;
  concernFlag: boolean | null;
  concernNote: string | null;
  parent: {
    country: string;
    timezone: string;
  };
  student: {
    fullName: string;
    age: number;
    classYearGroup: string;
    countryOfStudy: string;
    curriculum: string;
    mainAcademicChallenge: string | null;
    academicGoal: string | null;
  };
  tutor: {
    user: {
      name: string;
    };
  };
  subject: {
    name: string;
  };
  enrollment: {
    id: string;
    status: EnrollmentStatus;
    tutoringPlan: {
      name: string;
      sessionsPerWeek: number;
    };
  } | null;
  homework?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: Date | null;
    status: HomeworkStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export type AdminLessonFilters = {
  status?: LessonStatus;
  enrollmentId?: string;
  tutorId?: string;
  studentId?: string;
  subjectId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
};

export function buildAdminLessonWhereInput(
  filters: AdminLessonFilters = {}
): Prisma.LessonWhereInput {
  const where: Prisma.LessonWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.enrollmentId) {
    where.enrollmentId = filters.enrollmentId;
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

  if (filters.dateFrom || filters.dateTo) {
    where.startTime = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {})
    };
  }

  return where;
}

export function buildParentLessonWhereInput(
  userId: string,
  lessonId?: string
): Prisma.LessonWhereInput {
  return {
    ...(lessonId ? { id: lessonId } : {}),
    parent: {
      userId
    }
  };
}

export function buildTutorLessonWhereInput(
  userId: string,
  lessonId?: string
): Prisma.LessonWhereInput {
  return {
    ...(lessonId ? { id: lessonId } : {}),
    tutor: {
      userId
    }
  };
}

export function buildParentLessonDetailView(lesson: LessonDetailViewSource) {
  return {
    id: lesson.id,
    title: lesson.title,
    childName: lesson.student.fullName,
    tutorName: lesson.tutor.user.name,
    subjectName: lesson.subject.name,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    timezone: lesson.timezone,
    meetingLink: lesson.meetingLink,
    status: lesson.status,
    enrollment: lesson.enrollment
      ? {
          id: lesson.enrollment.id,
          status: lesson.enrollment.status,
          planName: lesson.enrollment.tutoringPlan.name,
          sessionsPerWeek: lesson.enrollment.tutoringPlan.sessionsPerWeek
        }
      : null
  };
}

export function buildTutorLessonDetailView(lesson: LessonDetailViewSource) {
  return {
    id: lesson.id,
    title: lesson.title,
    studentName: lesson.student.fullName,
    subjectName: lesson.subject.name,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    timezone: lesson.timezone,
    meetingLink: lesson.meetingLink,
    status: lesson.status,
    parentContext: {
      country: lesson.parent.country,
      timezone: lesson.parent.timezone
    },
    delivery: {
      attendanceMarkedAt: lesson.attendanceMarkedAt,
      attended: lesson.attended,
      lessonNotes: lesson.lessonNotes,
      concernFlag: Boolean(lesson.concernFlag),
      concernNote: lesson.concernNote
    },
    homework: lesson.homework ?? [],
    learningContext: {
      age: lesson.student.age,
      classYearGroup: lesson.student.classYearGroup,
      countryOfStudy: lesson.student.countryOfStudy,
      curriculum: lesson.student.curriculum,
      mainAcademicChallenge: lesson.student.mainAcademicChallenge,
      academicGoal: lesson.student.academicGoal
    }
  };
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
    where: buildParentLessonWhereInput(user.id),
    select: lessonSelect,
    orderBy: {
      startTime: "asc"
    }
  });
}

export async function getCurrentParentLessonById(lessonId: string) {
  const user = await requireParent();

  return db.lesson.findFirst({
    where: buildParentLessonWhereInput(user.id, lessonId),
    select: lessonSelect
  });
}

export async function getCurrentTutorLessons() {
  const user = await requireTutor();

  return db.lesson.findMany({
    where: buildTutorLessonWhereInput(user.id),
    select: lessonSelect,
    orderBy: {
      startTime: "asc"
    }
  });
}

export async function getCurrentTutorLessonById(lessonId: string) {
  const user = await requireTutor();

  return db.lesson.findFirst({
    where: buildTutorLessonWhereInput(user.id, lessonId),
    select: lessonSelect
  });
}

export async function getAdminLessonSubjects() {
  await requireAdmin();

  return db.subject.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: {
      name: "asc"
    }
  });
}
