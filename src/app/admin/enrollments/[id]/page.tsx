import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";

import { AssignTutorForm } from "@/components/forms/admin/assign-tutor-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import {
  getAdminEnrollmentById
} from "@/server/queries/enrollment.queries";
import { getAdminLessons } from "@/server/queries/lesson.queries";
import { getActiveTutors } from "@/server/queries/tutor.queries";

export const dynamic = "force-dynamic";

type AdminEnrollmentDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not available";
  }

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

export default async function AdminEnrollmentDetailPage({
  params
}: AdminEnrollmentDetailPageProps) {
  const [enrollment, activeTutors, lessons] = await Promise.all([
    getAdminEnrollmentById(params.id),
    getActiveTutors(),
    getAdminLessons({ enrollmentId: params.id })
  ]);

  if (!enrollment) {
    notFound();
  }

  const status = getEnrollmentStatusMeta(enrollment.status);
  const latestPayment = enrollment.payments[0];
  const paymentStatus = latestPayment
    ? getPaymentStatusMeta(latestPayment.status)
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Enrollment Details"
        description="Assign a tutor and schedule lessons once the parent plan is active."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/enrollments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Enrollments
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/admin/lessons/new?enrollmentId=${enrollment.id}`}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Schedule Lesson
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              {enrollment.student.fullName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {enrollment.parent.user.name} | {enrollment.tutoringPlan.name}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DetailItem label="Parent email" value={enrollment.parent.user.email} />
          <DetailItem label="Parent country" value={enrollment.parent.country} />
          <DetailItem label="Timezone" value={enrollment.parent.timezone} />
          <DetailItem label="Child class/year" value={enrollment.student.classYearGroup} />
          <DetailItem label="Curriculum" value={enrollment.student.curriculum} />
          <DetailItem
            label="Assigned tutor"
            value={enrollment.assignedTutor?.user.name ?? "Not assigned"}
          />
          <DetailItem
            label="Plan"
            value={`${enrollment.tutoringPlan.name} (${enrollment.tutoringPlan.sessionsPerWeek} sessions/week)`}
          />
          <DetailItem
            label="Monthly price"
            value={`${enrollment.tutoringPlan.currency} ${enrollment.tutoringPlan.monthlyPrice.toString()}`}
          />
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Payment status
            </p>
            <div className="mt-2">
              {paymentStatus ? (
                <StatusBadge label={paymentStatus.label} tone={paymentStatus.tone} />
              ) : (
                <p className="text-sm font-medium text-text-primary">
                  Not submitted
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-royal-blue/20">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Assign Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollment.status === "ACTIVE" ? (
              <AssignTutorForm
                enrollmentId={enrollment.id}
                tutors={activeTutors}
                initialTutorId={enrollment.assignedTutorId}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
                Tutor assignment becomes available after payment activation.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-deep-navy">
                Lessons for Enrollment
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Scheduled lesson records attached to this active plan.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/admin/lessons/new?enrollmentId=${enrollment.id}`}>
                Add Lesson
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.length > 0 ? (
              lessons.map((lesson) => {
                const lessonStatus = getLessonStatusMeta(lesson.status);
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-deep-navy">
                        {lesson.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {lesson.subject.name} | {formatDateTime(lesson.startTime)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <StatusBadge
                        label={lessonStatus.label}
                        tone={lessonStatus.tone}
                      />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/lessons/${lesson.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
                No lessons have been scheduled for this enrollment yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
