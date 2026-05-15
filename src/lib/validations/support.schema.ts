import { z } from "zod";

export const SUPPORT_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "CLOSED"
] as const;

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const optionalLinkedId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const createSupportRequestSchema = z.object({
  subject: requiredTrimmedString("Support subject is required."),
  message: requiredTrimmedString("Support message is required."),
  studentId: optionalLinkedId,
  lessonId: optionalLinkedId,
  paymentId: optionalLinkedId,
  assessmentRequestId: optionalLinkedId
});

export const updateSupportRequestSchema = z.object({
  supportRequestId: requiredTrimmedString("Support request is required."),
  status: z.enum(SUPPORT_STATUSES, {
    required_error: "Support status is required.",
    invalid_type_error: "Support status is required."
  }),
  adminReply: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value && value.length > 0 ? value : undefined))
});

export const closeSupportRequestSchema = z.object({
  supportRequestId: requiredTrimmedString("Support request is required.")
});

export type CreateSupportRequestInput = z.infer<
  typeof createSupportRequestSchema
>;
export type UpdateSupportRequestInput = z.infer<
  typeof updateSupportRequestSchema
>;
export type CloseSupportRequestInput = z.infer<
  typeof closeSupportRequestSchema
>;
