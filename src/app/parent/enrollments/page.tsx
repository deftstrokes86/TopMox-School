import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import { getCurrentParentEnrollments } from "@/server/queries/enrollment.queries";

export const dynamic = "force-dynamic";

type EnrollmentListItem = Awaited<
  ReturnType<typeof getCurrentParentEnrollments>
>[number];

type ParentEnrollmentsPageProps = {
  searchParams?: {
    accepted?: string;
  };
};

function getEnrollmentAction(enrollment: EnrollmentListItem) {
  const latestPayment = enrollment.payments[0];

  if (
    enrollment.status === "PENDING_PAYMENT" &&
    latestPayment?.status === "PENDING" &&
    latestPayment.checkoutUrl
  ) {
    return {
      label: "Continue Checkout",
      href: latestPayment.checkoutUrl,
      description:
        "Flutterwave checkout has started. Continue checkout to complete payment securely."
    };
  }

  if (
    enrollment.status === "PENDING_PAYMENT" &&
    latestPayment?.status === "AWAITING_VERIFICATION"
  ) {
    return {
      label: "View Payment Status",
      href: `/parent/payments/${latestPayment.id}`,
      description: "Payment submitted and awaiting TopMox verification."
    };
  }

  switch (enrollment.status) {
    case "PENDING_PAYMENT":
      return {
        label: "Choose Payment Method",
        href: `/parent/payments/new?enrollmentId=${enrollment.id}`,
        description:
          "Choose Flutterwave checkout or submit manual transfer details for TopMox review."
      };
    case "ACTIVE":
      return {
        label: "View Lessons",
        href: "/parent/lessons",
        description: "Lessons will appear after scheduling."
      };
    case "PAUSED":
      return {
        label: "Contact TopMox",
        href: "/contact",
        description: "Contact TopMox to discuss this paused plan."
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        href: "/parent/support",
        description: "This plan is no longer active."
      };
    case "COMPLETED":
      return {
        label: "Completed",
        href: "/parent/reports",
        description: "Review reports and completed tutoring activity."
      };
  }
}

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentListItem }) {
  const status = getEnrollmentStatusMeta(enrollment.status);
  const latestPayment = enrollment.payments[0];
  const latestPaymentStatus = latestPayment
    ? getPaymentStatusMeta(latestPayment.status)
    : null;
  const action = getEnrollmentAction(enrollment);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {enrollment.tutoringPlan.name}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {enrollment.student.fullName} | {enrollment.student.classYearGroup}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-text-secondary">
          {enrollment.tutoringPlan.description}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Sessions
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {enrollment.tutoringPlan.sessionsPerWeek} per week
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Monthly Plan
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {enrollment.tutoringPlan.currency}{" "}
              {enrollment.tutoringPlan.monthlyPrice.toString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Payment
            </p>
            {latestPaymentStatus ? (
              <div className="mt-1">
                <StatusBadge
                  label={latestPaymentStatus.label}
                  tone={latestPaymentStatus.tone}
                />
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium text-text-primary">
                Not submitted
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-deep-navy">
            <GraduationCap className="h-4 w-4 text-royal-blue" />
            Payment next step
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {action.description}
          </p>
        </div>

        <Button
          asChild
          variant={enrollment.status === "PENDING_PAYMENT" ? "default" : "outline"}
          className="w-full sm:w-auto"
        >
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function ParentEnrollmentsPage({
  searchParams
}: ParentEnrollmentsPageProps) {
  const enrollments = await getCurrentParentEnrollments();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Tutoring Plans"
        description="Track accepted tutoring plans, payment next steps, and activation status for your child's TopMox support."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/assessments">
              <CalendarDays className="mr-2 h-4 w-4" />
              View Assessments
            </Link>
          </Button>
        }
      />

      {searchParams?.accepted === "1" ? (
        <Card className="border-success/25 bg-success/10">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-deep-navy">
                Your plan has been accepted.
              </p>
              <p className="text-sm text-text-secondary">
                Choose Flutterwave checkout or submit manual transfer details
                so TopMox can activate your child&apos;s tutoring plan after
                payment is verified.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/parent/payments/new">
                <CreditCard className="mr-2 h-4 w-4" />
                Choose Payment Method
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {enrollments.length === 0 ? (
        <EmptyState
          title="No tutoring plan yet"
          description="No tutoring plan yet. Once TopMox recommends a plan after assessment, it will appear here."
          action={
            <Button asChild>
              <Link href="/parent/assessments">View Assessments</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </section>
  );
}
