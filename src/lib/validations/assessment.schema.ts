import { z } from "zod";

export const ASSESSMENT_STATUSES = [
  "PENDING_REVIEW",
  "SCHEDULED",
  "COMPLETED",
  "PLAN_RECOMMENDED",
  "CONVERTED",
  "DECLINED"
] as const;

const nonEmptyString = (fieldLabel: string) =>
  z.string().trim().min(1, `${fieldLabel} is required`);

const cuidSchema = (fieldLabel: string) =>
  z.string().cuid(`${fieldLabel} is invalid`);

const requiredDateSchema = (fieldLabel: string) =>
  z.coerce.date({
    required_error: `${fieldLabel} is required`,
    invalid_type_error: `${fieldLabel} must be a valid date`
  });

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
  z.string().url("Meeting link must be a valid URL").optional()
);

export const createAssessmentRequestSchema = z
  .object({
    studentId: cuidSchema("Student"),
    subjectIds: z.array(cuidSchema("Subject")).optional(),
    subjects: z.array(nonEmptyString("Subject")).optional(),
    academicConcern: nonEmptyString("Academic concern"),
    preferredAssessmentDate: requiredDateSchema("Preferred assessment date"),
    preferredAssessmentTime: nonEmptyString("Preferred assessment time"),
    timezone: nonEmptyString("Timezone"),
    notes: optionalTrimmedString
  })
  .superRefine((value, context) => {
    const hasSubjectIds = (value.subjectIds?.length ?? 0) > 0;
    const hasSubjects = (value.subjects?.length ?? 0) > 0;

    if (!hasSubjectIds && !hasSubjects) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjects"],
        message: "At least one subject is required"
      });
    }
  });

export const scheduleAssessmentSchema = z.object({
  assessmentRequestId: cuidSchema("Assessment request"),
  scheduledAt: requiredDateSchema("Scheduled assessment time"),
  meetingLink: optionalUrlSchema,
  internalNotes: optionalTrimmedString
});

export const updateAssessmentStatusSchema = z.object({
  assessmentRequestId: cuidSchema("Assessment request"),
  status: z.enum(ASSESSMENT_STATUSES),
  internalNotes: optionalTrimmedString
});

export const updateAssessmentInternalNotesSchema = z.object({
  assessmentRequestId: cuidSchema("Assessment request"),
  internalNotes: optionalTrimmedString
});

export const assessmentOutcomeSchema = z.object({
  assessmentRequestId: cuidSchema("Assessment request"),
  academicLevelSummary: nonEmptyString("Academic level summary"),
  strengths: nonEmptyString("Strengths"),
  weakAreas: nonEmptyString("Weak areas"),
  recommendedSubjects: z
    .array(nonEmptyString("Recommended subject"))
    .min(1, "At least one recommended subject is required"),
  recommendedPlanId: cuidSchema("Recommended plan").optional().or(z.literal("")),
  recommendedWeeklyLessonCount: z
    .coerce.number({
      required_error: "Recommended weekly lesson count is required",
      invalid_type_error: "Recommended weekly lesson count must be a number"
    })
    .int("Recommended weekly lesson count must be a whole number")
    .positive("Recommended weekly lesson count must be greater than 0"),
  parentFacingSummary: nonEmptyString("Parent-facing summary"),
  internalAdminNotes: optionalTrimmedString
});

export type CreateAssessmentRequestInput = z.infer<
  typeof createAssessmentRequestSchema
>;
export type ScheduleAssessmentInput = z.infer<typeof scheduleAssessmentSchema>;
export type UpdateAssessmentStatusInput = z.infer<
  typeof updateAssessmentStatusSchema
>;
export type UpdateAssessmentInternalNotesInput = z.infer<
  typeof updateAssessmentInternalNotesSchema
>;
export type AssessmentOutcomeInput = z.infer<typeof assessmentOutcomeSchema>;
