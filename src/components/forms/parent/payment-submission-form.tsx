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
  createEnrollmentPaymentSchema,
  type CreateEnrollmentPaymentInput
} from "@/lib/validations/payment.schema";
import {
  createEnrollmentPaymentAction,
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
    value: "FLUTTERWAVE",
    label: "Pay with Flutterwave"
  },
  {
    value: "MANUAL_TRANSFER",
    label: "Submit manual transfer details"
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
      paymentMethod: "FLUTTERWAVE" as const,
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
  } = useForm<CreateEnrollmentPaymentInput>({
    resolver: zodResolver(createEnrollmentPaymentSchema),
    defaultValues
  });

  const selectedEnrollmentId = watch("enrollmentId");
  const selectedPaymentMethod = watch("paymentMethod");
  const selectedEnrollment = enrollments.find(
    (enrollment) => enrollment.id === selectedEnrollmentId
  );

  const onSubmit = (values: CreateEnrollmentPaymentInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await createEnrollmentPaymentAction(values);

      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof CreateEnrollmentPaymentInput, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (message) {
            setError(field, { message });
          }
        });
      }

      if (actionResult.success && actionResult.data?.redirectUrl) {
        window.location.assign(actionResult.data.redirectUrl);
        return;
      }

      if (actionResult.success) {
        router.push(actionResult.data?.successRoute ?? "/parent/payments");
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Choose the payment path that works best for your family.
        </p>
        <p className="mt-2">
          Flutterwave is the primary secure checkout option. Manual transfer is
          available as a fallback when TopMox has provided payment instructions
          or offline verification is preferred.
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

        {selectedPaymentMethod === "FLUTTERWAVE" ? (
          <div className="rounded-xl border border-success/25 bg-success/10 p-4 md:col-span-2">
            <p className="text-sm font-semibold text-deep-navy">
              Pay securely with Flutterwave.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Supports local and international payment options depending on
              your currency, location, and Flutterwave availability.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4 md:col-span-2">
              <p className="text-sm font-semibold text-deep-navy">
                Manual transfer fallback
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Use manual transfer if TopMox has provided payment instructions
                or if offline verification is preferred. Do not enter bank
                details here.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-reference">Reference optional</Label>
              <Input
                id="payment-reference"
                placeholder="Example: transfer reference or receipt number"
                {...register("reference")}
              />
              {errors.reference ? (
                <p className="text-xs text-danger">
                  {errors.reference.message}
                </p>
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
                <p className="text-xs text-danger">
                  {errors.proofUrl.message}
                </p>
              ) : null}
            </div>
          </>
        )}
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
            Starting payment...
          </>
        ) : selectedPaymentMethod === "FLUTTERWAVE" ? (
          "Continue to Flutterwave"
        ) : (
          "Submit Manual Transfer Details"
        )}
      </Button>
    </form>
  );
}
