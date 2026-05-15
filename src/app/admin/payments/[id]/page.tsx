import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PaymentReviewActions } from "@/components/forms/admin/payment-review-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrollmentStatusMeta } from "@/lib/utils/enrollment-status";
import { getPaymentStatusMeta } from "@/lib/utils/payment-status";
import { getAdminPaymentById } from "@/server/queries/payment.queries";

export const dynamic = "force-dynamic";

type AdminPaymentDetailPageProps = {
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

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
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

export default async function AdminPaymentDetailPage({
  params
}: AdminPaymentDetailPageProps) {
  const payment = await getAdminPaymentById(params.id);

  if (!payment) {
    notFound();
  }

  const paymentStatus = getPaymentStatusMeta(payment.status);
  const enrollmentStatus = payment.enrollment
    ? getEnrollmentStatusMeta(payment.enrollment.status)
    : null;
  const child = payment.student ?? payment.enrollment?.student ?? null;
  const plan = payment.enrollment?.tutoringPlan ?? null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payment Review"
        description="Verify payment details, approve confirmed payments, or reject unclear submissions while keeping the parent informed."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/payments">
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
                {payment.parent.user.name}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                {payment.parent.user.email}
              </p>
            </div>
            <StatusBadge label={paymentStatus.label} tone={paymentStatus.tone} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DetailItem
            label="Amount"
            value={`${payment.currency} ${payment.amount.toString()}`}
          />
          <DetailItem
            label="Payment method"
            value={formatEnumLabel(payment.paymentMethod)}
          />
          <DetailItem label="Submitted" value={formatDate(payment.createdAt)} />
          <DetailItem label="Reference" value={payment.reference} />
          <DetailItem label="Paid date" value={formatDate(payment.paidAt)} />
          <DetailItem label="Parent country" value={payment.parent.country} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Parent and Child Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <DetailItem label="Parent email" value={payment.parent.user.email} />
            <DetailItem label="WhatsApp" value={payment.parent.whatsappNumber} />
            <DetailItem label="Timezone" value={payment.parent.timezone} />
            <DetailItem label="Child name" value={child?.fullName} />
            <DetailItem
              label="Child age"
              value={child?.age ? `${child.age}` : null}
            />
            <DetailItem label="Class/year" value={child?.classYearGroup} />
            <DetailItem label="Country of study" value={child?.countryOfStudy} />
            <DetailItem label="Curriculum" value={child?.curriculum} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Enrollment and Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.enrollment ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-soft-cream/50 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Enrollment status
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {enrollmentStatus?.parentDescription}
                    </p>
                  </div>
                  {enrollmentStatus ? (
                    <StatusBadge
                      label={enrollmentStatus.label}
                      tone={enrollmentStatus.tone}
                    />
                  ) : null}
                </div>
                <DetailItem label="Plan" value={plan?.name} />
                <DetailItem label="Best for" value={plan?.bestFor} />
                <DetailItem
                  label="Sessions per week"
                  value={plan ? `${plan.sessionsPerWeek}` : null}
                />
                <DetailItem
                  label="Plan price"
                  value={
                    plan
                      ? `${plan.currency} ${plan.monthlyPrice.toString()}`
                      : null
                  }
                />
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
                This payment is not linked to an enrollment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Proof and Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Admin note" value={payment.adminNote} />
            {payment.proofUrl ? (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={payment.proofUrl} target="_blank" rel="noreferrer">
                  Open Proof URL
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p className="rounded-xl border border-border/80 bg-soft-cream/40 p-4 text-sm text-text-secondary">
                No proof URL was provided. Review the payment reference and
                contact the parent outside the system if needed.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-royal-blue/20">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Review Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentReviewActions
              paymentId={payment.id}
              status={payment.status}
              initialAdminNote={payment.adminNote}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
