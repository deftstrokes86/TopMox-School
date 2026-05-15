import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { LessonStatusActions } from "@/components/forms/admin/lesson-status-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getAdminLessonById } from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

type AdminLessonDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
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

export default async function AdminLessonDetailPage({
  params
}: AdminLessonDetailPageProps) {
  const lesson = await getAdminLessonById(params.id);

  if (!lesson) {
    notFound();
  }

  const lessonStatus = getLessonStatusMeta(lesson.status);
  const enrollmentStatus = lesson.enrollment
    ? getEnrollmentStatusMeta(lesson.enrollment.status)
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lesson Details"
        description="Review scheduled lesson context and update admin-controlled lesson status."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/lessons">
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
              {lesson.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {lesson.student.fullName} | {lesson.subject.name}
            </p>
          </div>
          <StatusBadge label={lessonStatus.label} tone={lessonStatus.tone} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DetailItem label="Parent" value={lesson.parent.user.name} />
          <DetailItem label="Child" value={lesson.student.fullName} />
          <DetailItem label="Tutor" value={lesson.tutor.user.name} />
          <DetailItem label="Subject" value={lesson.subject.name} />
          <DetailItem label="Start time" value={formatDateTime(lesson.startTime)} />
          <DetailItem label="End time" value={formatDateTime(lesson.endTime)} />
          <DetailItem label="Timezone" value={lesson.timezone} />
          <DetailItem
            label="Enrollment"
            value={lesson.enrollment?.tutoringPlan.name ?? "Not linked"}
          />
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Enrollment status
            </p>
            <div className="mt-2">
              {enrollmentStatus ? (
                <StatusBadge
                  label={enrollmentStatus.label}
                  tone={enrollmentStatus.tone}
                />
              ) : (
                <p className="text-sm font-medium text-text-primary">
                  Not linked
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Meeting and Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.meetingLink ? (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={lesson.meetingLink} target="_blank" rel="noreferrer">
                  Open Meeting Link
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
                No meeting link has been added yet.
              </p>
            )}

            <p className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4 text-sm text-text-secondary">
              Homework, lesson notes, and tutor completion workflows are
              intentionally deferred to later phases.
            </p>
          </CardContent>
        </Card>

        <Card className="border-royal-blue/20">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Admin Status Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonStatusActions lessonId={lesson.id} status={lesson.status} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
