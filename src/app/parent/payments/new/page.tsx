import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  PaymentSubmissionForm,
  type PaymentEnrollmentOption
} from "@/components/forms/parent/payment-submission-form";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getCurrentParentPendingPaymentEnrollments } from "@/server/queries/enrollment.queries";
import { getPaymentFallbackForCurrency } from "@/server/services/location.service";

export const dynamic = "force-dynamic";

type NewParentPaymentPageProps = {
  searchParams?: {
    enrollmentId?: string;
  };
};

export default async function NewParentPaymentPage({
  searchParams
}: NewParentPaymentPageProps) {
  const [onboardingStatus, pendingEnrollments] = await Promise.all([
    getParentOnboardingStatus(),
    getCurrentParentPendingPaymentEnrollments()
  ]);

  if (!onboardingStatus.hasParentProfile) {
    redirect("/parent/onboarding");
  }

  const enrollmentOptions: PaymentEnrollmentOption[] = pendingEnrollments.map(
    (enrollment) => {
      const paymentFallback = getPaymentFallbackForCurrency(
        enrollment.tutoringPlan.currency
      );

      return {
        id: enrollment.id,
        childName: enrollment.student.fullName,
        planName: enrollment.tutoringPlan.name,
        sessionsPerWeek: enrollment.tutoringPlan.sessionsPerWeek,
        amount: enrollment.tutoringPlan.monthlyPrice.toString(),
        currency: enrollment.tutoringPlan.currency,
        flutterwaveEnabled: paymentFallback.flutterwaveEnabled,
        paymentAvailabilityNote: paymentFallback.note
      };
    }
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Choose Payment Method"
        description="Start Flutterwave checkout or submit manual transfer details for a pending tutoring plan."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/payments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        }
      />

      {enrollmentOptions.length === 0 ? (
        <EmptyState
          title="No plan awaiting payment"
          description="There is no pending tutoring plan ready for payment. Accept a recommended plan first, or wait for TopMox to prepare a recommendation."
          action={
            <Button asChild>
              <Link href="/parent/enrollments">View Tutoring Plans</Link>
            </Button>
          }
        />
      ) : (
        <Card className="border-royal-blue/20 shadow-soft">
          <CardContent className="p-6 md:p-8">
            <PaymentSubmissionForm
              enrollments={enrollmentOptions}
              defaultEnrollmentId={searchParams?.enrollmentId}
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
