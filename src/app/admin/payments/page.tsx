import type { PaymentMethod, PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, CreditCard, Search } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import {
  getAdminPayments,
  getAdminPaymentSummary
} from "@/server/queries/payment.queries";

export const dynamic = "force-dynamic";

type AdminPaymentsPageProps = {
  searchParams: {
    status?: string;
    paymentMethod?: string;
    search?: string;
  };
};

type PaymentListItem = Awaited<ReturnType<typeof getAdminPayments>>[number];

const STATUS_OPTIONS: PaymentStatus[] = [
  "AWAITING_VERIFICATION",
  "PAID",
  "FAILED",
  "PENDING",
  "CANCELLED",
  "REFUNDED"
];

const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "MANUAL_TRANSFER",
  "FLUTTERWAVE"
];

function parseStatus(value?: string): PaymentStatus | undefined {
  return STATUS_OPTIONS.includes(value as PaymentStatus)
    ? (value as PaymentStatus)
    : undefined;
}

function parsePaymentMethod(value?: string): PaymentMethod | undefined {
  return PAYMENT_METHOD_OPTIONS.includes(value as PaymentMethod)
    ? (value as PaymentMethod)
    : undefined;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function FilterControls({
  status,
  paymentMethod,
  search
}: {
  status?: string;
  paymentMethod?: string;
  search?: string;
}) {
  return (
    <Card className="border-royal-blue/20">
      <CardContent className="p-5">
        <form className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr_auto]" action="/admin/payments">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent or child
            </span>
            <input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search parent, email, or child"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {getPaymentStatusMeta(option).label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Method
            </span>
            <select
              name="paymentMethod"
              defaultValue={paymentMethod ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All methods</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full lg:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button asChild variant="outline" className="w-full lg:w-auto">
              <Link href="/admin/payments">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
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
              {payment.parent.user.name}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {payment.parent.user.email}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Child / Plan
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {childName}
            </p>
            <p className="text-xs text-text-muted">{planName}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Amount
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {payment.currency} {payment.amount.toString()}
            </p>
            <p className="text-xs text-text-muted">
              {formatEnumLabel(payment.paymentMethod)}
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Reference: {payment.reference || "Not provided"}
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/payments/${payment.id}`}>
              Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminPaymentsPage({
  searchParams
}: AdminPaymentsPageProps) {
  const [summary, payments] = await Promise.all([
    getAdminPaymentSummary(),
    getAdminPayments({
      status: parseStatus(searchParams.status),
      paymentMethod: parsePaymentMethod(searchParams.paymentMethod),
      search: searchParams.search
    })
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payments"
        description="Review manual payment submissions, approve verified payments, and activate enrollments once payment is confirmed."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Awaiting Verification"
          value={`${summary.awaitingVerification}`}
          context="Payments submitted by parents and waiting for review."
          icon={<CreditCard className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Paid"
          value={`${summary.paid}`}
          context="Payments approved by TopMox."
        />
        <StatCard
          label="Failed"
          value={`${summary.failed}`}
          context="Payments that could not be verified."
        />
      </div>

      <FilterControls
        status={searchParams.status}
        paymentMethod={searchParams.paymentMethod}
        search={searchParams.search}
      />

      {payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No payments match the current filters. Submitted parent payments will appear here for admin verification."
          action={
            <Button asChild>
              <Link href="/admin">Back to Admin Overview</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </section>
  );
}
