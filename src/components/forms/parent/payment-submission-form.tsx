"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createManualPaymentSchema,
  type CreateManualPaymentInput
} from "@/lib/validations/payment.schema";
import {
  createManualPaymentAction,
  type PaymentActionResult
} from "@/server/actions/payment.actions";

export type PaymentEnrollmentOption = {
  id: string;
  childName: string;
  planName: string;
  sessionsPerWeek: number;
  amount: string;
  currency: string;
};

const paymentMethodOptions = [
  {
    value: "MANUAL_TRANSFER",
    label: "Bank transfer"
  }
] as const;

type PaymentSubmissionFormProps = {
  enrollments: PaymentEnrollmentOption[];
  defaultEnrollmentId?: string;
};

function getDefaultEnrollmentId(
  enrollments: PaymentEnrollmentOption[],
  requestedEnrollmentId?: string
) {
  if (
    requestedEnrollmentId &&
    enrollments.some((enrollment) => enrollment.id === requestedEnrollmentId)
  ) {
    return requestedEnrollmentId;
  }

  return enrollments[0]?.id ?? "";
}

export function PaymentSubmissionForm({
  enrollments,
  defaultEnrollmentId
}: PaymentSubmissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PaymentActionResult | null>(null);

  const defaultValues = useMemo(
    () => ({
      enrollmentId: getDefaultEnrollmentId(enrollments, defaultEnrollmentId),
      paymentMethod: "MANUAL_TRANSFER" as const,
      reference: "",
      proofUrl: ""
    }),
    [defaultEnrollmentId, enrollments]
  );

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<CreateManualPaymentInput>({
    resolver: zodResolver(createManualPaymentSchema),
    defaultValues
  });

  const selectedEnrollmentId = watch("enrollmentId");
  const selectedEnrollment = enrollments.find(
    (enrollment) => enrollment.id === selectedEnrollmentId
  );

  const onSubmit = (values: CreateManualPaymentInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await createManualPaymentAction(values);

      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof CreateManualPaymentInput, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (message) {
            setError(field, { message });
          }
        });
      }

      if (actionResult.success) {
        router.push("/parent/payments?submitted=1");
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          TopMox payment instructions will be confirmed by the admin team.
        </p>
        <p className="mt-2">
          Submit the reference or proof link you have available. TopMox will
          verify the details before activating the tutoring plan.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="payment-enrollment">Tutoring plan</Label>
          <select
            id="payment-enrollment"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("enrollmentId")}
          >
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {enrollment.childName} - {enrollment.planName}
              </option>
            ))}
          </select>
          {errors.enrollmentId ? (
            <p className="text-xs text-danger">{errors.enrollmentId.message}</p>
          ) : null}
        </div>

        {selectedEnrollment ? (
          <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/25 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
              Expected amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-deep-navy">
              {selectedEnrollment.currency} {selectedEnrollment.amount}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {selectedEnrollment.planName} for {selectedEnrollment.childName} -{" "}
              {selectedEnrollment.sessionsPerWeek} sessions per week
            </p>
          </div>
        ) : null}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="payment-method">Payment method</Label>
          <select
            id="payment-method"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("paymentMethod")}
          >
            {paymentMethodOptions.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod ? (
            <p className="text-xs text-danger">{errors.paymentMethod.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-reference">Reference optional</Label>
          <Input
            id="payment-reference"
            placeholder="Example: transfer reference or receipt number"
            {...register("reference")}
          />
          {errors.reference ? (
            <p className="text-xs text-danger">{errors.reference.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-proof-url">Proof URL optional</Label>
          <Input
            id="payment-proof-url"
            placeholder="Example: secure receipt link"
            {...register("proofUrl")}
          />
          {errors.proofUrl ? (
            <p className="text-xs text-danger">{errors.proofUrl.message}</p>
          ) : null}
        </div>
      </div>

      {result?.success ? (
        <div className="flex items-start gap-3 rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <p>{result.message}</p>
        </div>
      ) : null}

      {result && !result.success ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {result.message}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting payment...
          </>
        ) : (
          "Submit Payment Details"
        )}
      </Button>
    </form>
  );
}
