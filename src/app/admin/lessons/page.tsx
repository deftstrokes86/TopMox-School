import type { LessonStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LESSON_STATUSES } from "@/lib/constants/statuses";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import {
  getAdminLessons,
  getAdminLessonSubjects
} from "@/server/queries/lesson.queries";
import { getActiveTutors } from "@/server/queries/tutor.queries";

export const dynamic = "force-dynamic";

type AdminLessonsPageProps = {
  searchParams: {
    status?: string;
    tutorId?: string;
    subjectId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
};

function parseLessonStatus(value?: string): LessonStatus | undefined {
  return LESSON_STATUSES.includes(value as LessonStatus)
    ? (value as LessonStatus)
    : undefined;
}

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

type LessonListItem = Awaited<ReturnType<typeof getAdminLessons>>[number];

function LessonCard({ lesson }: { lesson: LessonListItem }) {
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
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {lesson.parent.user.name}
            </p>
          </div>
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
              Start
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDateTime(lesson.startTime)}
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

        <div className="flex justify-end">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/lessons/${lesson.id}`}>
              View Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminLessonsPage({
  searchParams
}: AdminLessonsPageProps) {
  const [lessons, tutors, subjects] = await Promise.all([
    getAdminLessons({
      status: parseLessonStatus(searchParams.status),
      tutorId: searchParams.tutorId || undefined,
      subjectId: searchParams.subjectId || undefined,
      dateFrom: parseDate(searchParams.dateFrom),
      dateTo: parseDate(searchParams.dateTo)
    }),
    getActiveTutors(),
    getAdminLessonSubjects()
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lessons"
        description="Review scheduled lessons, tutor assignments, subjects, and lesson status across active enrollments."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/lessons/new">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Lesson
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20">
        <CardContent className="p-5">
          <form
            className="grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr_0.8fr_0.8fr_auto]"
            action="/admin/lessons"
          >
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Status
              </span>
              <select
                name="status"
                defaultValue={searchParams.status ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All</option>
                {LESSON_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getLessonStatusMeta(status).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Tutor
              </span>
              <select
                name="tutorId"
                defaultValue={searchParams.tutorId ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All tutors</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Subject
              </span>
              <select
                name="subjectId"
                defaultValue={searchParams.subjectId ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                From
              </span>
              <input
                type="date"
                name="dateFrom"
                defaultValue={searchParams.dateFrom ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                To
              </span>
              <input
                type="date"
                name="dateTo"
                defaultValue={searchParams.dateTo ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full lg:w-auto">
                Filter
              </Button>
              <Button asChild variant="outline" className="w-full lg:w-auto">
                <Link href="/admin/lessons">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons found"
          description="Scheduled lessons will appear here after an active enrollment has a tutor and lesson time."
          action={
            <Button asChild>
              <Link href="/admin/lessons/new">Schedule Lesson</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </section>
  );
}
