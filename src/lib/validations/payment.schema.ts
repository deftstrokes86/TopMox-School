import { z } from "zod";

import {
  ACTIVE_PAYMENT_METHODS,
  SUPPORTED_PAYMENT_CURRENCIES
} from "@/lib/constants/payments";

export const PAYMENT_METHODS = ACTIVE_PAYMENT_METHODS;

export const PAYMENT_REVIEW_DECISIONS = ["APPROVE", "REJECT"] as const;

const cuidSchema = (fieldLabel: string) =>
  z.string().cuid(`${fieldLabel} is invalid`);

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().url("Proof URL must be a valid URL").optional()
);

export const createManualPaymentSchema = z.object({
  enrollmentId: cuidSchema("Enrollment"),
  paymentMethod: z.literal("MANUAL_TRANSFER", {
    required_error: "Payment method is required",
    invalid_type_error: "Payment method is required"
  }),
  reference: optionalTrimmedString,
  proofUrl: optionalUrlSchema
});

export const createEnrollmentPaymentSchema = z.object({
  enrollmentId: cuidSchema("Enrollment"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
    invalid_type_error: "Payment method is required"
  }),
  reference: optionalTrimmedString,
  proofUrl: optionalUrlSchema
});

export const paymentCurrencySchema = z.enum(SUPPORTED_PAYMENT_CURRENCIES, {
  required_error: "Currency is required",
  invalid_type_error: "Currency is required"
});

export const reviewPaymentSchema = z
  .object({
    paymentId: cuidSchema("Payment"),
    decision: z.enum(PAYMENT_REVIEW_DECISIONS, {
      required_error: "Review decision is required",
      invalid_type_error: "Review decision is required"
    }),
    adminNote: optionalTrimmedString
  })
  .superRefine((value, context) => {
    if (value.decision === "REJECT" && !value.adminNote?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["adminNote"],
        message:
          "Add an admin note when rejecting so the parent knows what to do next"
      });
    }
  });

export const updatePaymentAdminNoteSchema = z.object({
  paymentId: cuidSchema("Payment"),
  adminNote: optionalTrimmedString
});

export type CreateManualPaymentInput = z.infer<
  typeof createManualPaymentSchema
>;
export type CreateEnrollmentPaymentInput = z.infer<
  typeof createEnrollmentPaymentSchema
>;
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
export type UpdatePaymentAdminNoteInput = z.infer<
  typeof updatePaymentAdminNoteSchema
>;
