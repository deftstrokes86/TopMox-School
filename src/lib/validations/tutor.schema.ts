import { z } from "zod";

const idSchema = (label: string) => z.string().min(1, `${label} is required`);

export const assignTutorToEnrollmentSchema = z.object({
  enrollmentId: idSchema("Enrollment"),
  tutorId: idSchema("Tutor")
});

export type AssignTutorToEnrollmentInput = z.infer<
  typeof assignTutorToEnrollmentSchema
>;
