import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomeworkStatusMeta } from "@/lib/utils/homework-status";
import { getCurrentParentHomework } from "@/server/queries/homework.queries";

export const dynamic = "force-dynamic";

type ParentHomeworkItem = Awaited<
  ReturnType<typeof getCurrentParentHomework>
>[number];

function formatDate(value: Date | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function HomeworkCard({ homework }: { homework: ParentHomeworkItem }) {
  const status = getHomeworkStatusMeta(homework.status);

  return (
    <Card className="border-border/80 bg-white">
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

        <div className="grid gap-3 md:grid-cols-3">
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
              Lesson
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {homework.lessonTitle}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Due Date
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(homework.dueDate)}
            </p>
          </div>
        </div>

        {homework.lessonHref ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={homework.lessonHref}>
              View Related Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function ParentHomeworkPage() {
  const homework = await getCurrentParentHomework();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Homework"
        description="See practice work assigned by your child's TopMox tutor, including due dates, lesson context, and current status."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/lessons">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              View Lessons
            </Link>
          </Button>
        }
      />

      {homework.length === 0 ? (
        <EmptyState
          title="No homework assigned yet"
          description="No homework assigned yet. When your child's tutor assigns practice work, it will appear here."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {homework.map((item) => (
            <HomeworkCard key={item.id} homework={item} />
          ))}
        </div>
      )}
    </section>
  );
}
