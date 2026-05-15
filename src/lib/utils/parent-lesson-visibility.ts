import type { HomeworkStatus, LessonStatus } from "@prisma/client";

const ACTIVE_HOMEWORK_STATUSES = new Set<HomeworkStatus>([
  "ASSIGNED",
  "SUBMITTED",
  "OVERDUE"
]);

export type ParentLessonVisibilitySummary = {
  recentLessonNote: {
    lessonId: string;
    title: string;
    childName: string;
    subjectName: string;
    lessonNotes: string;
    startTime: Date;
  } | null;
  homeworkAssignedCount: number;
  nextHomeworkDue: {
    id: string;
    title: string;
    dueDate: Date | null;
    status: HomeworkStatus;
  } | null;
};

export function getParentLessonVisibilitySummary(
  lessons: Array<{
    id: string;
    title: string;
    status: LessonStatus;
    startTime: Date;
    lessonNotes: string | null;
    student: {
      fullName: string;
    };
    subject: {
      name: string;
    };
  }>,
  homework: Array<{
    id: string;
    title: string;
    status: HomeworkStatus;
    dueDate: Date | null;
  }>
): ParentLessonVisibilitySummary {
  const [recentLesson] = [...lessons]
    .filter(
      (lesson) =>
        lesson.status === "COMPLETED" && Boolean(lesson.lessonNotes?.trim())
    )
    .sort((left, right) => right.startTime.getTime() - left.startTime.getTime());

  const activeHomework = homework.filter((item) =>
    ACTIVE_HOMEWORK_STATUSES.has(item.status)
  );

  const [nextHomeworkDue] = [...activeHomework].sort((left, right) => {
    if (!left.dueDate && !right.dueDate) {
      return 0;
    }

    if (!left.dueDate) {
      return 1;
    }

    if (!right.dueDate) {
      return -1;
    }

    return left.dueDate.getTime() - right.dueDate.getTime();
  });

  return {
    recentLessonNote: recentLesson
      ? {
          lessonId: recentLesson.id,
          title: recentLesson.title,
          childName: recentLesson.student.fullName,
          subjectName: recentLesson.subject.name,
          lessonNotes: recentLesson.lessonNotes ?? "",
          startTime: recentLesson.startTime
        }
      : null,
    homeworkAssignedCount: activeHomework.length,
    nextHomeworkDue: nextHomeworkDue
      ? {
          id: nextHomeworkDue.id,
          title: nextHomeworkDue.title,
          dueDate: nextHomeworkDue.dueDate,
          status: nextHomeworkDue.status
        }
      : null
  };
}
