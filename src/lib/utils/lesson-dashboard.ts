import type { LessonStatusValue } from "./lesson-status";

type LessonDashboardSource = {
  id: string;
  title: string;
  startTime: Date;
  status: LessonStatusValue;
  student: {
    fullName: string;
  };
  subject: {
    name: string;
  };
  timezone?: string;
  meetingLink?: string | null;
};

export type LessonDashboardSummary = {
  id: string;
  title: string;
  childName: string;
  subjectName: string;
  startTime: Date;
  status: LessonStatusValue;
  timezone?: string;
  meetingLink?: string | null;
};

const UPCOMING_LESSON_STATUSES = new Set<LessonStatusValue>([
  "SCHEDULED",
  "RESCHEDULED"
]);

function toLessonDashboardSummary(
  lesson: LessonDashboardSource
): LessonDashboardSummary {
  return {
    id: lesson.id,
    title: lesson.title,
    childName: lesson.student.fullName,
    subjectName: lesson.subject.name,
    startTime: lesson.startTime,
    status: lesson.status,
    timezone: lesson.timezone,
    meetingLink: lesson.meetingLink
  };
}

function sortLessonsByStartTime<T extends { startTime: Date }>(lessons: T[]): T[] {
  return [...lessons].sort(
    (left, right) => left.startTime.getTime() - right.startTime.getTime()
  );
}

function isUpcomingLesson(lesson: LessonDashboardSource, now: Date): boolean {
  return (
    UPCOMING_LESSON_STATUSES.has(lesson.status) &&
    lesson.startTime.getTime() >= now.getTime()
  );
}

export function getNextUpcomingLessonSummary(
  lessons: LessonDashboardSource[],
  now = new Date()
): LessonDashboardSummary | null {
  const [nextLesson] = sortLessonsByStartTime(
    lessons.filter((lesson) => isUpcomingLesson(lesson, now))
  );

  return nextLesson ? toLessonDashboardSummary(nextLesson) : null;
}

export function getTutorLessonDashboardSummary(
  lessons: LessonDashboardSource[],
  now = new Date()
): {
  today: LessonDashboardSummary[];
  upcoming: LessonDashboardSummary[];
} {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const visibleLessons = sortLessonsByStartTime(
    lessons.filter((lesson) => isUpcomingLesson(lesson, now))
  );

  return {
    today: visibleLessons
      .filter((lesson) => lesson.startTime <= endOfToday)
      .map(toLessonDashboardSummary),
    upcoming: visibleLessons
      .filter((lesson) => lesson.startTime > endOfToday)
      .map(toLessonDashboardSummary)
  };
}
