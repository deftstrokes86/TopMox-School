import type { HomeworkStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HOMEWORK_STATUSES } from "@/lib/constants/statuses";
import { getHomeworkStatusMeta } from "@/lib/utils/homework-status";
import { getAdminHomework } from "@/server/queries/homework.queries";
import { getActiveTutors } from "@/server/queries/tutor.queries";

export const dynamic = "force-dynamic";

type AdminHomeworkPageProps = {
  searchParams: {
    status?: string;
    tutorId?: string;
    studentId?: string;
  };
};

function parseHomeworkStatus(value?: string): HomeworkStatus | undefined {
  return HOMEWORK_STATUSES.includes(value as HomeworkStatus)
    ? (value as HomeworkStatus)
    : undefined;
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

type AdminHomeworkItem = Awaited<ReturnType<typeof getAdminHomework>>[number];

function HomeworkCard({ homework }: { homework: AdminHomeworkItem }) {
  const status = getHomeworkStatusMeta(homework.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {homework.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {homework.childName} | {homework.subjectName}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-text-secondary">
          {homework.description}
        </p>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {homework.parentName}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Tutor
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {homework.tutorName}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Due date
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(homework.dueDate)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Created
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDateTime(homework.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Lesson: {homework.lessonTitle}
          </p>
          {homework.lessonHref ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={homework.lessonHref}>
                View Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminHomeworkPage({
  searchParams
}: AdminHomeworkPageProps) {
  const [homework, tutors] = await Promise.all([
    getAdminHomework({
      status: parseHomeworkStatus(searchParams.status),
      tutorId: searchParams.tutorId || undefined,
      studentId: searchParams.studentId || undefined
    }),
    getActiveTutors()
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Homework"
        description="Review homework activity across students, tutors, lessons, and completion statuses."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/lessons">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Review Lessons
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20">
        <CardContent className="p-5">
          <form
            className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
            action="/admin/homework"
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
                {HOMEWORK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getHomeworkStatusMeta(status).label}
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
                Student ID
              </span>
              <input
                name="studentId"
                defaultValue={searchParams.studentId ?? ""}
                placeholder="Optional exact student id"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full lg:w-auto">
                Filter
              </Button>
              <Button asChild variant="outline" className="w-full lg:w-auto">
                <Link href="/admin/homework">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {homework.length === 0 ? (
        <EmptyState
          title="No homework found"
          description="Homework assigned by tutors will appear here with student, parent, tutor, lesson, and due date context."
          action={
            <Button asChild variant="outline">
              <Link href="/admin/lessons">Review Lessons</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {homework.map((item) => (
            <HomeworkCard key={item.id} homework={item} />
          ))}
        </div>
      )}
    </section>
  );
}
