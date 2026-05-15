import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getTutorLessonDashboardSummary } from "@/lib/utils/lesson-dashboard";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getCurrentTutorLessons } from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

function formatLessonDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

type TutorDashboardLesson = ReturnType<
  typeof getTutorLessonDashboardSummary
>["today"][number];

function DashboardLessonCard({ lesson }: { lesson: TutorDashboardLesson }) {
  const status = getLessonStatusMeta(lesson.status);

  return (
    <div className="rounded-xl border border-border/80 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-deep-navy">{lesson.title}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {lesson.childName} | {lesson.subjectName}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {formatLessonDateTime(lesson.startTime)}
            {lesson.timezone ? ` | ${lesson.timezone}` : ""}
          </p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
      <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
        <Link href={`/tutor/lessons/${lesson.id}`}>
          View Teaching Context
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function TutorDashboardPage() {
  const user = await requireDashboardAccess("TUTOR");
  const lessons = await getCurrentTutorLessons();
  const lessonSummary = getTutorLessonDashboardSummary(lessons);
  const nextLessons = [
    ...lessonSummary.today,
    ...lessonSummary.upcoming.slice(0, Math.max(0, 3 - lessonSummary.today.length))
  ].slice(0, 3);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Tutor Dashboard"
        description="See your assigned TopMox lessons and the teaching context needed for upcoming sessions."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tutor/lessons">
              <CalendarDays className="mr-2 h-4 w-4" />
              View All Lessons
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-text-primary">
            Signed-in Account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This is your protected tutor workspace. Lesson notes and homework
            actions are coming in later phases.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
              </p>
              <p className="mt-1 font-medium text-text-primary">{user.name}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Email
              </p>
              <p className="mt-1 font-medium text-text-primary">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Role:
            </span>
            <StatusBadge label={user.role} tone="info" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Today and Upcoming
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Your next assigned lessons will appear here as TopMox schedules
              active enrollments.
            </p>
          </div>
          <StatusBadge
            label={`${lessonSummary.today.length} today`}
            tone={lessonSummary.today.length > 0 ? "info" : "neutral"}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {nextLessons.length > 0 ? (
            nextLessons.map((lesson) => (
              <DashboardLessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-6 text-sm text-text-secondary">
              No assigned lessons are scheduled yet. When TopMox assigns a
              lesson to you, it will appear here with the student and subject
              context.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
