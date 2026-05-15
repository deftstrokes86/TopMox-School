import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getParentPaymentStatusDescription,
  getPaymentStatusMeta
} from "@/lib/utils/payment-status";
import { getPaymentForCurrentParent } from "@/server/queries/payment.queries";

export const dynamic = "force-dynamic";

type ParentPaymentDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not available";
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

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function ParentPaymentDetailPage({
  params
}: ParentPaymentDetailPageProps) {
  const payment = await getPaymentForCurrentParent(params.id);

  if (!payment) {
    notFound();
  }

  const status = getPaymentStatusMeta(payment.status);
  const childName =
    payment.student?.fullName ?? payment.enrollment?.student.fullName ?? "Child";
  const planName = payment.enrollment?.tutoringPlan.name ?? "Tutoring plan";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payment Details"
        description="Review your submitted payment details and TopMox verification status."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/payments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-deep-navy">
                {planName}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">{childName}</p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
          <p className="max-w-3xl text-sm text-text-secondary">
            {getParentPaymentStatusDescription({
              paymentMethod: payment.paymentMethod,
              status: payment.status
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem
              label="Amount"
              value={`${payment.currency} ${payment.amount.toString()}`}
            />
            <DetailItem
              label="Payment Method"
              value={formatPaymentMethod(payment.paymentMethod)}
            />
            <DetailItem label="Submitted" value={formatDate(payment.createdAt)} />
            <DetailItem label="Reference" value={payment.reference} />
            <DetailItem label="Verified At" value={formatDate(payment.paidAt)} />
            <DetailItem label="Admin Note" value={payment.adminNote} />
            <DetailItem label="Failure Reason" value={payment.failureReason} />
          </div>

          {payment.status === "PENDING" && payment.checkoutUrl ? (
            <Card className="border-success/25 bg-success/10 shadow-none">
              <CardContent className="space-y-3 p-5">
                <p className="font-semibold text-deep-navy">
                  Flutterwave checkout is ready.
                </p>
                <p className="text-sm text-text-secondary">
                  Continue to Flutterwave to complete payment securely. Your
                  tutoring plan will only activate after payment is verified.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={payment.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Continue Checkout
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {payment.proofUrl ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={payment.proofUrl} target="_blank" rel="noreferrer">
                Open Proof Link
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
