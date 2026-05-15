import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getCurrentParentLessons } from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

type ParentLessonListItem = Awaited<
  ReturnType<typeof getCurrentParentLessons>
>[number];

const ACTIVE_LESSON_STATUSES = new Set(["SCHEDULED", "RESCHEDULED"]);

function formatLessonDateTime(value: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone
    }).format(value);
  } catch {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(value);
  }
}

function LessonCard({ lesson }: { lesson: ParentLessonListItem }) {
  const status = getLessonStatusMeta(lesson.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {lesson.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {lesson.student.fullName} | {lesson.subject.name}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Tutor
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {lesson.tutor.user.name}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Lesson Time
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatLessonDateTime(lesson.startTime, lesson.timezone)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Timezone
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {lesson.timezone}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {lesson.meetingLink && lesson.status !== "CANCELLED" ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={lesson.meetingLink} target="_blank" rel="noreferrer">
                Open Meeting Link
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <p className="text-sm text-text-secondary">
              Meeting details will appear here when TopMox has added them.
            </p>
          )}

          <Button asChild className="w-full sm:w-auto">
            <Link href={`/parent/lessons/${lesson.id}`}>
              View Lesson Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ParentLessonsPage() {
  const lessons = await getCurrentParentLessons();
  const now = new Date();
  const upcomingLessons = lessons.filter(
    (lesson) =>
      ACTIVE_LESSON_STATUSES.has(lesson.status) && lesson.startTime >= now
  );
  const pastOrInactiveLessons = lessons.filter(
    (lesson) =>
      !ACTIVE_LESSON_STATUSES.has(lesson.status) || lesson.startTime < now
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lessons"
        description="See your child's scheduled TopMox lessons, tutor, subject, meeting link, and lesson status in one place."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent">
              <CalendarDays className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons scheduled yet"
          description="No lessons scheduled yet. Once TopMox assigns a tutor and schedules lessons, they will appear here."
          action={
            <Button asChild>
              <Link href="/parent/enrollments">View Tutoring Plans</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-deep-navy">
              Upcoming Lessons
            </h2>
            {upcomingLessons.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {upcomingLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <Card className="border-border/80 bg-white">
                <CardContent className="p-5 text-sm text-text-secondary">
                  No upcoming lessons are scheduled right now. TopMox will add
                  lesson times after tutor coordination.
                </CardContent>
              </Card>
            )}
          </section>

          {pastOrInactiveLessons.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-deep-navy">
                Completed, Missed, or Cancelled Lessons
              </h2>
              <div className="grid gap-4 xl:grid-cols-2">
                {pastOrInactiveLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
