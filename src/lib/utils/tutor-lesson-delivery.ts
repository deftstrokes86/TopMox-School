import type { HomeworkStatus, LessonStatus } from "@prisma/client";

const EDITABLE_LESSON_STATUSES = new Set<LessonStatus>([
  "SCHEDULED",
  "RESCHEDULED"
]);

const READ_ONLY_COMPLETION_STATUSES = new Set<LessonStatus>([
  "COMPLETED",
  "MISSED"
]);

const ACTIVE_HOMEWORK_STATUSES = new Set<HomeworkStatus>([
  "ASSIGNED",
  "SUBMITTED",
  "OVERDUE"
]);

export type TutorLessonDeliveryPanelState = {
  canShowCompletionForm: boolean;
  canAssignHomework: boolean;
  showReadOnlyCompletionSummary: boolean;
  message: string;
};

export function getTutorLessonDeliveryPanelState({
  isAssignedTutor,
  lessonStatus
}: {
  isAssignedTutor: boolean;
  lessonStatus: LessonStatus;
}): TutorLessonDeliveryPanelState {
  if (!isAssignedTutor) {
    return {
      canShowCompletionForm: false,
      canAssignHomework: false,
      showReadOnlyCompletionSummary: false,
      message: "This lesson is not assigned to the current tutor."
    };
  }

  if (EDITABLE_LESSON_STATUSES.has(lessonStatus)) {
    return {
      canShowCompletionForm: true,
      canAssignHomework: true,
      showReadOnlyCompletionSummary: false,
      message: "Record attendance, lesson notes, concerns, and homework."
    };
  }

  if (READ_ONLY_COMPLETION_STATUSES.has(lessonStatus)) {
    return {
      canShowCompletionForm: false,
      canAssignHomework: true,
      showReadOnlyCompletionSummary: true,
      message: "This lesson has already been delivered."
    };
  }

  return {
    canShowCompletionForm: false,
    canAssignHomework: false,
    showReadOnlyCompletionSummary: false,
    message: "Lesson delivery actions are not available for this lesson status."
  };
}

export function getTutorLessonWorkSummary(
  lessons: Array<{
    id: string;
    status: LessonStatus;
    startTime: Date;
  }>,
  homework: Array<{
    id: string;
    status: HomeworkStatus;
  }>,
  now = new Date()
) {
  const lessonsNeedingNotes = lessons.filter(
    (lesson) =>
      EDITABLE_LESSON_STATUSES.has(lesson.status) &&
      lesson.startTime.getTime() <= now.getTime()
  ).length;

  const upcomingLessons = lessons.filter(
    (lesson) =>
      EDITABLE_LESSON_STATUSES.has(lesson.status) &&
      lesson.startTime.getTime() > now.getTime()
  ).length;

  const recentlyCompletedLessons = lessons.filter(
    (lesson) => lesson.status === "COMPLETED"
  ).length;

  const activeHomework = homework.filter((item) =>
    ACTIVE_HOMEWORK_STATUSES.has(item.status)
  ).length;

  return {
    lessonsNeedingNotes,
    upcomingLessons,
    recentlyCompletedLessons,
    activeHomework
  };
}
