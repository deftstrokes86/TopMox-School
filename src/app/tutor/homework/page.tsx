import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomeworkStatusMeta } from "@/lib/utils/homework-status";
import { getCurrentTutorHomework } from "@/server/queries/homework.queries";

export const dynamic = "force-dynamic";

type TutorHomeworkItem = Awaited<
  ReturnType<typeof getCurrentTutorHomework>
>[number];

function formatDate(value: Date | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function HomeworkCard({ homework }: { homework: TutorHomeworkItem }) {
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
              {homework.student.fullName} | {homework.student.classYearGroup}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{homework.description}</p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Due Date
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(homework.dueDate)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Lesson
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {homework.lesson
                ? `${homework.lesson.title} | ${homework.lesson.subject.name}`
                : "Lesson not linked"}
            </p>
          </div>
        </div>

        {homework.lesson ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/tutor/lessons/${homework.lesson.id}`}>
              Open Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function TutorHomeworkPage() {
  const homework = await getCurrentTutorHomework();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Homework"
        description="Review homework you have assigned from TopMox lessons and return to the lesson context when needed."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/tutor/lessons">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              View Lessons
            </Link>
          </Button>
        }
      />

      {homework.length === 0 ? (
        <EmptyState
          title="No homework assigned yet"
          description="Homework you assign from lesson delivery pages will appear here with student, lesson, due date, and status."
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
