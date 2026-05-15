import { z } from "zod";

export const COMMUNICATION_LOG_TYPES = [
  "CALL",
  "WHATSAPP",
  "EMAIL",
  "INTERNAL_NOTE",
  "PAYMENT_FOLLOW_UP",
  "ACADEMIC_FOLLOW_UP"
] as const;

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const optionalLinkedId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const createCommunicationLogSchema = z.object({
  type: z.enum(COMMUNICATION_LOG_TYPES, {
    required_error: "Communication log type is required.",
    invalid_type_error: "Communication log type is required."
  }),
  message: requiredTrimmedString("Communication log message is required."),
  parentId: optionalLinkedId,
  studentId: optionalLinkedId,
  assessmentRequestId: optionalLinkedId,
  lessonId: optionalLinkedId,
  paymentId: optionalLinkedId,
  supportRequestId: optionalLinkedId
});

export type CreateCommunicationLogInput = z.infer<
  typeof createCommunicationLogSchema
>;
