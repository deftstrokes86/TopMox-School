import type { EnrollmentStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import {
  getAdminEnrollments,
  getAdminEnrollmentSummary
} from "@/server/queries/enrollment.queries";

export const dynamic = "force-dynamic";

type AdminEnrollmentsPageProps = {
  searchParams: {
    status?: string;
    needsTutorAssignment?: string;
  };
};

const ENROLLMENT_STATUS_OPTIONS: EnrollmentStatus[] = [
  "PENDING_PAYMENT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED"
];

function parseStatus(value?: string): EnrollmentStatus | undefined {
  return ENROLLMENT_STATUS_OPTIONS.includes(value as EnrollmentStatus)
    ? (value as EnrollmentStatus)
    : undefined;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

type EnrollmentListItem = Awaited<ReturnType<typeof getAdminEnrollments>>[number];

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentListItem }) {
  const status = getEnrollmentStatusMeta(enrollment.status);
  const latestPayment = enrollment.payments[0];
  const paymentStatus = latestPayment
    ? getPaymentStatusMeta(latestPayment.status)
    : null;

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {enrollment.student.fullName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Parent: {enrollment.parent.user.name} | {enrollment.tutoringPlan.name}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Assigned Tutor
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {enrollment.assignedTutor?.user.name ?? "Not assigned"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Payment
            </p>
            {paymentStatus ? (
              <div className="mt-1">
                <StatusBadge label={paymentStatus.label} tone={paymentStatus.tone} />
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium text-text-primary">
                Not submitted
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Plan
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {enrollment.tutoringPlan.sessionsPerWeek} sessions/week
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Created
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(enrollment.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            {enrollment.status === "ACTIVE" && !enrollment.assignedTutorId
              ? "This active enrollment is ready for tutor assignment."
              : "Review enrollment details, assigned tutor, payments, and lessons."}
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/enrollments/${enrollment.id}`}>
              View / Assign Tutor
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminEnrollmentsPage({
  searchParams
}: AdminEnrollmentsPageProps) {
  const needsTutorAssignment = searchParams.needsTutorAssignment === "1";
  const [summary, enrollments] = await Promise.all([
    getAdminEnrollmentSummary(),
    getAdminEnrollments({
      status: parseStatus(searchParams.status),
      needsTutorAssignment
    })
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="Review active tutoring plans, assign tutors, and prepare enrollments for scheduled lessons."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/lessons/new">
              <UserCheck className="mr-2 h-4 w-4" />
              Schedule Lesson
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Active Enrollments"
          value={`${summary.active}`}
          context="Tutoring plans ready for tutor assignment and lessons."
        />
        <StatCard
          label="Need Tutor"
          value={`${summary.needsTutorAssignment}`}
          context="Active enrollments without an assigned tutor."
        />
      </div>

      <Card className="border-royal-blue/20">
        <CardContent className="p-5">
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" action="/admin/enrollments">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Status
              </span>
              <select
                name="status"
                defaultValue={searchParams.status ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                {ENROLLMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getEnrollmentStatusMeta(option).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-end gap-2 rounded-md border border-border/70 bg-soft-cream/50 p-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                name="needsTutorAssignment"
                value="1"
                defaultChecked={needsTutorAssignment}
              />
              Show active enrollments needing tutor assignment
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full md:w-auto">
                Filter
              </Button>
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href="/admin/enrollments">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="Active parent tutoring plans will appear here for tutor assignment and lesson scheduling."
          action={
            <Button asChild>
              <Link href="/admin/payments">Review Payments</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </section>
  );
}
