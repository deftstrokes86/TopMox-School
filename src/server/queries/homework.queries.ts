import type { HomeworkStatus, Prisma } from "@prisma/client";

import { requireParent, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

const parentHomeworkSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      fullName: true
    }
  },
  lesson: {
    select: {
      id: true,
      title: true,
      subject: {
        select: {
          name: true
        }
      },
      tutor: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.HomeworkSelect;

type ParentHomeworkListItemSource = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
  student: {
    fullName: string;
  };
  lesson: {
    id: string;
    title: string;
    subject: {
      name: string;
    };
    tutor: {
      user: {
        name: string;
      };
    };
  } | null;
};

export type ParentHomeworkListItem = ReturnType<typeof buildParentHomeworkListItem>;

export function buildParentHomeworkWhereInput(
  userId: string,
  homeworkId?: string
): Prisma.HomeworkWhereInput {
  return {
    ...(homeworkId ? { id: homeworkId } : {}),
    student: {
      parent: {
        userId
      }
    }
  };
}

export function buildParentHomeworkListItem(item: ParentHomeworkListItemSource) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    dueDate: item.dueDate,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    childName: item.student.fullName,
    lessonTitle: item.lesson?.title ?? "Lesson not linked",
    subjectName: item.lesson?.subject.name ?? "Subject not linked",
    tutorName: item.lesson?.tutor.user.name ?? "Tutor not linked",
    lessonHref: item.lesson ? `/parent/lessons/${item.lesson.id}` : null
  };
}

export async function getCurrentParentHomework() {
  const user = await requireParent();

  const homework = await db.homework.findMany({
    where: buildParentHomeworkWhereInput(user.id),
    select: parentHomeworkSelect,
    orderBy: [
      {
        dueDate: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  return homework.map(buildParentHomeworkListItem);
}

export async function getCurrentTutorHomework() {
  const user = await requireTutor();

  return db.homework.findMany({
    where: {
      tutor: {
        userId: user.id
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          fullName: true,
          classYearGroup: true
        }
      },
      lesson: {
        select: {
          id: true,
          title: true,
          startTime: true,
          subject: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: [
      {
        dueDate: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });
}
