import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTutorLessonDashboardSummary } from "@/lib/utils/lesson-dashboard";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getCurrentTutorLessons } from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

type TutorLessonListItem = Awaited<
  ReturnType<typeof getCurrentTutorLessons>
>[number];

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

function LessonCard({ lesson }: { lesson: TutorLessonListItem }) {
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
              Lesson Time
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatLessonDateTime(lesson.startTime, lesson.timezone)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent Timezone
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {lesson.parent.timezone}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent Country
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {lesson.parent.country}
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
              Meeting details will appear here when they are available.
            </p>
          )}

          <Button asChild className="w-full sm:w-auto">
            <Link href={`/tutor/lessons/${lesson.id}`}>
              View Teaching Context
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TutorLessonsPage() {
  const lessons = await getCurrentTutorLessons();
  const summary = getTutorLessonDashboardSummary(lessons);
  const visibleIds = new Set([
    ...summary.today.map((lesson) => lesson.id),
    ...summary.upcoming.map((lesson) => lesson.id)
  ]);
  const otherLessons = lessons.filter((lesson) => !visibleIds.has(lesson.id));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assigned Lessons"
        description="See your TopMox lesson schedule, student context, subject, timezone, and meeting access."
      />

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons assigned yet"
          description="Your assigned lessons will appear here after TopMox schedules sessions for active enrollments."
        />
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-deep-navy">
              Today&apos;s Lessons
            </h2>
            {summary.today.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {summary.today.map((summaryLesson) => {
                  const lesson = lessons.find(
                    (item) => item.id === summaryLesson.id
                  );
                  return lesson ? (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ) : null;
                })}
              </div>
            ) : (
              <Card className="border-border/80 bg-white">
                <CardContent className="p-5 text-sm text-text-secondary">
                  No assigned lessons are scheduled for today.
                </CardContent>
              </Card>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-deep-navy">
              Upcoming Lessons
            </h2>
            {summary.upcoming.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {summary.upcoming.map((summaryLesson) => {
                  const lesson = lessons.find(
                    (item) => item.id === summaryLesson.id
                  );
                  return lesson ? (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ) : null;
                })}
              </div>
            ) : (
              <Card className="border-border/80 bg-white">
                <CardContent className="p-5 text-sm text-text-secondary">
                  No upcoming lessons are scheduled yet.
                </CardContent>
              </Card>
            )}
          </section>

          {otherLessons.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-deep-navy">
                Other Lesson Records
              </h2>
              <div className="grid gap-4 xl:grid-cols-2">
                {otherLessons.map((lesson) => (
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
