import { z } from "zod";

export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "PAYMENT_GATEWAY_PLACEHOLDER"
] as const;

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
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
    invalid_type_error: "Payment method is required"
  }),
  reference: optionalTrimmedString,
  proofUrl: optionalUrlSchema
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
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
export type UpdatePaymentAdminNoteInput = z.infer<
  typeof updatePaymentAdminNoteSchema
>;
