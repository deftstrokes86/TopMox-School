import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import { getCurrentParentPayments } from "@/server/queries/payment.queries";

export const dynamic = "force-dynamic";

type PaymentListItem = Awaited<ReturnType<typeof getCurrentParentPayments>>[number];

type ParentPaymentsPageProps = {
  searchParams?: {
    submitted?: string;
  };
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatPaymentMethod(value: PaymentListItem["paymentMethod"]): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function PaymentCard({ payment }: { payment: PaymentListItem }) {
  const status = getPaymentStatusMeta(payment.status);
  const childName =
    payment.student?.fullName ?? payment.enrollment?.student.fullName ?? "Child";
  const planName = payment.enrollment?.tutoringPlan.name ?? "Tutoring plan";

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {planName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">{childName}</p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Amount
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {payment.currency} {payment.amount.toString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Method
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatPaymentMethod(payment.paymentMethod)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Submitted
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(payment.createdAt)}
            </p>
          </div>
        </div>

        <p className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4 text-sm text-text-secondary">
          {status.parentDescription}
        </p>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/parent/payments/${payment.id}`}>
            View Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function ParentPaymentsPage({
  searchParams
}: ParentPaymentsPageProps) {
  const payments = await getCurrentParentPayments();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track payment submissions and verification status for your accepted TopMox tutoring plans."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/parent/payments/new">
              <CreditCard className="mr-2 h-4 w-4" />
              Submit Payment Details
            </Link>
          </Button>
        }
      />

      {searchParams?.submitted === "1" ? (
        <Card className="border-success/25 bg-success/10">
          <CardContent className="p-5">
            <p className="font-semibold text-deep-navy">
              Your payment has been submitted for review.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              TopMox will verify the details and activate the tutoring plan when
              payment is confirmed.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {payments.length === 0 ? (
        <EmptyState
          title="No payments submitted yet"
          description="No payments submitted yet. Once you accept a tutoring plan, you can submit payment details for verification."
          action={
            <Button asChild>
              <Link href="/parent/enrollments">View Tutoring Plans</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </section>
  );
}
