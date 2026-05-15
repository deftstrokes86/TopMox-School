import { z } from "zod";

export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "PAYMENT_GATEWAY_PLACEHOLDER"
] as const;

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

export type CreateManualPaymentInput = z.infer<
  typeof createManualPaymentSchema
>;
