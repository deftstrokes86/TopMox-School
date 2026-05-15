import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import {
  buildTutorLessonDetailView,
  getCurrentTutorLessonById
} from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

type TutorLessonDetailPageProps = {
  params: {
    id: string;
  };
};

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

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function TutorLessonDetailPage({
  params
}: TutorLessonDetailPageProps) {
  const lesson = await getCurrentTutorLessonById(params.id);

  if (!lesson) {
    notFound();
  }

  const view = buildTutorLessonDetailView(lesson);
  const lessonStatus = getLessonStatusMeta(view.status);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lesson Teaching Context"
        description="Review the lesson schedule and student learning context you need before teaching."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/tutor/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              {view.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {view.studentName} | {view.subjectName}
            </p>
          </div>
          <StatusBadge label={lessonStatus.label} tone={lessonStatus.tone} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Student" value={view.studentName} />
            <DetailItem label="Subject" value={view.subjectName} />
            <DetailItem label="Timezone" value={view.timezone} />
            <DetailItem
              label="Start Time"
              value={formatLessonDateTime(view.startTime, view.timezone)}
            />
            <DetailItem
              label="End Time"
              value={formatLessonDateTime(view.endTime, view.timezone)}
            />
            <DetailItem
              label="Parent Location Context"
              value={`${view.parentContext.country} | ${view.parentContext.timezone}`}
            />
          </div>

          <Card className="border-warm-gold/25 bg-warm-gold/10 shadow-none">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="font-semibold text-deep-navy">Meeting access</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Use this link at the scheduled lesson time. Parent contact
                  details are intentionally not shown in this teaching view.
                </p>
              </div>
              {view.meetingLink && view.status !== "CANCELLED" ? (
                <Button asChild className="w-full sm:w-auto">
                  <a href={view.meetingLink} target="_blank" rel="noreferrer">
                    Open Meeting Link
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-white p-4 text-sm text-text-secondary">
                  No meeting link has been added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-royal-blue/20 bg-soft-blue/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl text-deep-navy">
                Student Learning Context
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Age" value={view.learningContext.age} />
              <DetailItem
                label="Class / Year Group"
                value={view.learningContext.classYearGroup}
              />
              <DetailItem
                label="Country of Study"
                value={view.learningContext.countryOfStudy}
              />
              <DetailItem
                label="Curriculum"
                value={view.learningContext.curriculum}
              />
              <div className="rounded-lg border border-border/70 bg-white p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Main Academic Challenge
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {view.learningContext.mainAcademicChallenge}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-white p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Academic Goal
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {view.learningContext.academicGoal}
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="rounded-xl border border-border/80 bg-soft-cream/40 p-4 text-sm text-text-secondary">
            Lesson note submission, homework assignment, and completion actions
            are intentionally reserved for the next lesson workflow phases.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
