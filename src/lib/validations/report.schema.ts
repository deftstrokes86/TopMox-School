import { z } from "zod";

const idSchema = (label: string) => z.string().min(1, `${label} is required`);

const requiredTextSchema = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const reportStatusSchema = z.enum(["DRAFT", "REVIEW", "PUBLISHED"]);
const progressStatusSchema = z.enum([
  "NEEDS_ATTENTION",
  "IMPROVING",
  "ON_TRACK",
  "EXCELLENT"
]);

const reportingMonthSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.coerce.date({ invalid_type_error: "Reporting month is required" }));

export const createProgressReportSchema = z.object({
  studentId: idSchema("Student"),
  enrollmentId: z.string().trim().optional(),
  reportingMonth: reportingMonthSchema,
  subjectsCovered: requiredTextSchema("Subjects covered"),
  attendanceSummary: requiredTextSchema("Attendance summary"),
  strengths: requiredTextSchema("Strengths"),
  areasNeedingImprovement: requiredTextSchema("Areas needing improvement"),
  homeworkCompletion: requiredTextSchema("Homework completion"),
  tutorComments: requiredTextSchema("Tutor comments"),
  recommendedNextSteps: requiredTextSchema("Recommended next steps"),
  parentActionPoints: requiredTextSchema("Parent action points"),
  overallProgressStatus: progressStatusSchema
});

export const updateProgressReportSchema = createProgressReportSchema.extend({
  reportId: idSchema("Report")
});

export const updateReportStatusSchema = z.object({
  reportId: idSchema("Report"),
  status: reportStatusSchema
});

export type CreateProgressReportInput = z.infer<
  typeof createProgressReportSchema
>;
export type UpdateProgressReportInput = z.infer<
  typeof updateProgressReportSchema
>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
