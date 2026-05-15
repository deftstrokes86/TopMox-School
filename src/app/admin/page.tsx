import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  UserCheck
} from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getAdminLessonDeliveryDashboardSummary } from "@/lib/utils/admin-lesson-delivery";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import {
  getAdminAssessmentRequests,
  getAssessmentRequestCountsByStatus
} from "@/server/queries/assessment.queries";
import { getAdminEnrollmentSummary } from "@/server/queries/enrollment.queries";
import { getAdminHomework } from "@/server/queries/homework.queries";
import { getAdminLessons } from "@/server/queries/lesson.queries";
import {
  getAdminPayments,
  getAdminPaymentSummary
} from "@/server/queries/payment.queries";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatPaymentMethod(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export default async function AdminDashboardPage() {
  const user = await requireDashboardAccess("ADMIN");
  const [counts, recentAssessments, paymentSummary, recentPayments] =
    await Promise.all([
      getAssessmentRequestCountsByStatus(),
      getAdminAssessmentRequests({ take: 5 }),
      getAdminPaymentSummary(),
      getAdminPayments({ take: 5 })
    ]);
  const [enrollmentSummary, upcomingLessons, deliveryLessons, adminHomework] =
    await Promise.all([
      getAdminEnrollmentSummary(),
      getAdminLessons({
        status: "SCHEDULED",
        dateFrom: new Date(),
        take: 5
      }),
      getAdminLessons(),
      getAdminHomework()
    ]);
  const deliverySummary = getAdminLessonDeliveryDashboardSummary(
    deliveryLessons,
    adminHomework
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="TopMox operations dashboard will manage assessments, parents, tutors, lessons, payments, reports, and revenue visibility."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/assessments">
                <ClipboardList className="mr-2 h-4 w-4" />
                Manage Assessments
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/payments">
                <CreditCard className="mr-2 h-4 w-4" />
                Review Payments
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/enrollments">
                <UserCheck className="mr-2 h-4 w-4" />
                Assign Tutors
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/lessons">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Schedule Lessons
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/homework">
                <BookOpenCheck className="mr-2 h-4 w-4" />
                Review Homework
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-3">
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
          <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Role
            </p>
            <div className="mt-1">
              <StatusBadge label={user.role} tone="info" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Assessments"
          value={`${counts.PENDING_REVIEW}`}
          context="Parent requests awaiting TopMox review."
          icon={<CalendarClock className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Scheduled Assessments"
          value={`${counts.SCHEDULED}`}
          context="Assessments with confirmed date and time."
          icon={<CalendarClock className="h-5 w-5 text-info" />}
        />
        <StatCard
          label="Completed"
          value={`${counts.COMPLETED}`}
          context="Ready for academic outcome recording."
        />
        <StatCard
          label="Plan Recommended"
          value={`${counts.PLAN_RECOMMENDED}`}
          context="Awaiting the next commercial workflow phase."
        />
        <StatCard
          label="Payments Awaiting"
          value={`${paymentSummary.awaitingVerification}`}
          context="Manual payment submissions needing admin review."
          icon={<CreditCard className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Active Enrollments"
          value={`${enrollmentSummary.active}`}
          context="Tutoring plans ready for assignment and lessons."
        />
        <StatCard
          label="Need Tutor"
          value={`${enrollmentSummary.needsTutorAssignment}`}
          context="Active enrollments without an assigned tutor."
          icon={<UserCheck className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Upcoming Lessons"
          value={`${upcomingLessons.length}`}
          context="Next scheduled lessons visible to admin."
          icon={<CalendarPlus className="h-5 w-5 text-info" />}
        />
        <StatCard
          label="Completed This Week"
          value={`${deliverySummary.lessonsCompletedThisWeek}`}
          context="Completed lessons available for admin delivery review."
          icon={<BookOpenCheck className="h-5 w-5 text-success" />}
        />
        <StatCard
          label="Need Notes"
          value={`${deliverySummary.lessonsNeedingNotes}`}
          context="Completed or missed lessons without tutor notes."
          icon={<ClipboardList className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Concern Flags"
          value={`${deliverySummary.concernFlags}`}
          context="Lessons where a tutor flagged extra student attention."
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Homework Assigned"
          value={`${deliverySummary.homeworkAssigned}`}
          context="Active homework currently assigned to students."
          icon={<BookOpenCheck className="h-5 w-5 text-info" />}
        />
      </div>

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Recent Assessment Requests
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Latest parent submissions and schedule activity.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/assessments">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAssessments.length > 0 ? (
            recentAssessments.map((assessment) => {
              const status = getAssessmentStatusMeta(assessment.status);
              return (
                <div
                  key={assessment.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-deep-navy">
                      {assessment.student.fullName}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Parent: {assessment.parent.user.name} | Scheduled:{" "}
                      {formatDateTime(assessment.scheduledAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <StatusBadge label={status.label} tone={status.tone} />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/assessments/${assessment.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
              No assessment requests yet. New parent submissions will appear
              here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Upcoming Lessons
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Scheduled lessons ready for parent and tutor visibility.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/lessons">
              View Lessons
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingLessons.length > 0 ? (
            upcomingLessons.map((lesson) => {
              const lessonStatus = getLessonStatusMeta(lesson.status);
              return (
                <div
                  key={lesson.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-deep-navy">
                      {lesson.student.fullName}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {lesson.subject.name} with {lesson.tutor.user.name} |{" "}
                      {formatDateTime(lesson.startTime)}
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
              No upcoming lessons have been scheduled yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Recent Payment Submissions
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Latest manual payment records submitted for verification.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/payments">
              View Payments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment) => {
              const childName =
                payment.student?.fullName ??
                payment.enrollment?.student.fullName ??
                "Child";
              const paymentStatus = getPaymentStatusMeta(payment.status);
              return (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-deep-navy">
                      {payment.parent.user.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {childName} | {payment.currency}{" "}
                      {payment.amount.toString()} |{" "}
                      {formatPaymentMethod(payment.paymentMethod)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <StatusBadge
                      label={paymentStatus.label}
                      tone={paymentStatus.tone}
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/payments/${payment.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
              No payment submissions yet. New parent payment records will appear
              here.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
