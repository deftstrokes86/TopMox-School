import type { HomeworkStatus, LessonStatus } from "@prisma/client";

type LessonDeliverySummarySource = {
  status: LessonStatus;
  startTime: Date;
  lessonNotes?: string | null;
  concernFlag?: boolean | null;
};

type HomeworkSummarySource = {
  status: HomeworkStatus;
};

export function getAdminLessonDeliveryDashboardSummary(
  lessons: LessonDeliverySummarySource[],
  homework: HomeworkSummarySource[],
  now = new Date()
) {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  return {
    lessonsCompletedThisWeek: lessons.filter(
      (lesson) =>
        lesson.status === "COMPLETED" &&
        lesson.startTime >= sevenDaysAgo &&
        lesson.startTime <= now
    ).length,
    lessonsNeedingNotes: lessons.filter(
      (lesson) =>
        ["COMPLETED", "MISSED"].includes(lesson.status) &&
        !lesson.lessonNotes?.trim()
    ).length,
    concernFlags: lessons.filter((lesson) => Boolean(lesson.concernFlag))
      .length,
    homeworkAssigned: homework.filter(
      (homeworkItem) => homeworkItem.status === "ASSIGNED"
    ).length
  };
}
