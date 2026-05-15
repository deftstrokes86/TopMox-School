import { LessonStatus } from "@prisma/client";
import { z } from "zod";

const idSchema = (label: string) => z.string().min(1, `${label} is required`);

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

const dateTimeSchema = (label: string) =>
  z.coerce.date({
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be a valid date`
  });

export const createLessonSchema = z
  .object({
    enrollmentId: idSchema("Enrollment"),
    studentId: idSchema("Student"),
    tutorId: idSchema("Tutor"),
    subjectId: idSchema("Subject"),
    title: z.string().trim().min(1, "Lesson title is required"),
    startTime: dateTimeSchema("Start time"),
    endTime: dateTimeSchema("End time"),
    timezone: z.string().trim().min(1, "Timezone is required"),
    meetingLink: optionalUrlSchema
  })
  .superRefine((value, context) => {
    if (value.endTime <= value.startTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time"
      });
    }
  });

export const updateLessonStatusSchema = z.object({
  lessonId: idSchema("Lesson"),
  status: z.nativeEnum(LessonStatus, {
    required_error: "Lesson status is required",
    invalid_type_error: "Lesson status is invalid"
  })
});

export const completeTutorLessonSchema = z
  .object({
    lessonId: idSchema("Lesson"),
    attended: z.boolean({
      required_error: "Attendance is required",
      invalid_type_error: "Attendance is required"
    }),
    lessonNotes: z.string().trim().optional(),
    concernFlag: z.boolean().default(false),
    concernNote: z.string().trim().optional()
  })
  .superRefine((value, context) => {
    if (value.concernFlag && !value.concernNote) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["concernNote"],
        message: "Concern note is required when a concern is flagged"
      });
    }
  });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonStatusInput = z.infer<typeof updateLessonStatusSchema>;
export type CompleteTutorLessonInput = z.infer<typeof completeTutorLessonSchema>;
