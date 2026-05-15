import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getHomeworkStatusMeta } from "@/lib/utils/homework-status";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import {
  buildParentLessonDetailView,
  getCurrentParentLessonById
} from "@/server/queries/lesson.queries";

export const dynamic = "force-dynamic";

type ParentLessonDetailPageProps = {
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

function formatDate(value: Date | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
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

export default async function ParentLessonDetailPage({
  params
}: ParentLessonDetailPageProps) {
  const lesson = await getCurrentParentLessonById(params.id);

  if (!lesson) {
    notFound();
  }

  const view = buildParentLessonDetailView(lesson);
  const lessonStatus = getLessonStatusMeta(view.status);
  const enrollmentStatus = view.enrollment
    ? getEnrollmentStatusMeta(view.enrollment.status)
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Lesson Details"
        description="Review the lesson time, tutor, meeting link, and plan context for your child's scheduled TopMox lesson."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/lessons">
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
              {view.childName} | {view.subjectName}
            </p>
          </div>
          <StatusBadge label={lessonStatus.label} tone={lessonStatus.tone} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Child" value={view.childName} />
            <DetailItem label="Tutor" value={view.tutorName} />
            <DetailItem label="Subject" value={view.subjectName} />
            <DetailItem
              label="Start Time"
              value={formatLessonDateTime(view.startTime, view.timezone)}
            />
            <DetailItem
              label="End Time"
              value={formatLessonDateTime(view.endTime, view.timezone)}
            />
            <DetailItem label="Timezone" value={view.timezone} />
          </div>

          <Card className="border-warm-gold/25 bg-warm-gold/10 shadow-none">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="font-semibold text-deep-navy">Meeting access</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Use the meeting link at the scheduled lesson time. If the link
                  is missing, TopMox will update it before the lesson.
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
                Tutoring Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <DetailItem
                label="Plan"
                value={view.enrollment?.planName ?? "Not linked"}
              />
              <DetailItem
                label="Sessions"
                value={
                  view.enrollment
                    ? `${view.enrollment.sessionsPerWeek} per week`
                    : "Not linked"
                }
              />
              <div className="rounded-lg border border-border/70 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Enrollment Status
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

          <Card className="border-royal-blue/20 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="text-xl text-deep-navy">
                Lesson Progress Notes
              </CardTitle>
              <p className="text-sm text-text-secondary">
                After a lesson is completed, TopMox shows parent-safe notes so
                you can understand what was covered and what needs follow-up.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Attendance"
                  value={
                    view.delivery.attended === null
                      ? "Not marked yet"
                      : view.delivery.attended
                        ? "Attended"
                        : "Missed / did not attend"
                  }
                />
                <DetailItem
                  label="Attendance Marked"
                  value={
                    view.delivery.attendanceMarkedAt
                      ? formatLessonDateTime(
                          view.delivery.attendanceMarkedAt,
                          view.timezone
                        )
                      : "Not marked yet"
                  }
                />
              </div>

              {view.delivery.lessonNotes ? (
                <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                    Tutor Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {view.delivery.lessonNotes}
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-4 text-sm text-text-secondary">
                  Tutor notes will appear here after the lesson is completed.
                </p>
              )}

              {view.delivery.parentSafeConcernMessage ? (
                <p className="rounded-xl border border-warm-gold/40 bg-warm-gold/10 p-4 text-sm text-text-secondary">
                  {view.delivery.parentSafeConcernMessage}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-warm-gold/25 bg-white shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-warm-gold" />
                <CardTitle className="text-xl text-deep-navy">
                  Homework From This Lesson
                </CardTitle>
              </div>
              <p className="text-sm text-text-secondary">
                Practice work assigned by the tutor appears here so you can
                support follow-through without guessing.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {view.homework.length > 0 ? (
                view.homework.map((homework) => {
                  const homeworkStatus = getHomeworkStatusMeta(homework.status);

                  return (
                    <div
                      key={homework.id}
                      className="rounded-xl border border-border/80 bg-soft-cream/40 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-deep-navy">
                            {homework.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-text-secondary">
                            {homework.description}
                          </p>
                          <p className="mt-2 text-xs text-text-muted">
                            Due: {formatDate(homework.dueDate)}
                          </p>
                        </div>
                        <StatusBadge
                          label={homeworkStatus.label}
                          tone={homeworkStatus.tone}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-4 text-sm text-text-secondary">
                  No homework has been assigned from this lesson yet.
                </p>
              )}

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/parent/homework">
                  View All Homework
                  <BookOpenCheck className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}
