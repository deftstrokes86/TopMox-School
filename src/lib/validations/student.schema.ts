import { z } from "zod";

const nonEmptyString = (fieldLabel: string) =>
  z.string().trim().min(1, `${fieldLabel} is required`);

export const childProfileSchema = z.object({
  fullName: nonEmptyString("Child full name"),
  age: z
    .coerce.number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number"
    })
    .int("Age must be a whole number")
    .positive("Age must be greater than 0"),
  classYearGroup: nonEmptyString("Class or year group"),
  countryOfStudy: nonEmptyString("Country of study"),
  curriculum: nonEmptyString("Curriculum"),
  subjectsNeedingSupport: z
    .array(nonEmptyString("Subject"), {
      required_error: "At least one subject is required"
    })
    .min(1, "At least one subject is required"),
  mainAcademicChallenge: nonEmptyString("Main academic challenge"),
  academicGoal: nonEmptyString("Academic goal"),
  preferredLessonDays: z
    .array(nonEmptyString("Preferred lesson day"), {
      required_error: "Preferred lesson days are required"
    })
    .min(1, "Preferred lesson days are required"),
  preferredLessonTime: nonEmptyString("Preferred lesson time")
});

export const updateChildProfileSchema = childProfileSchema.extend({
  childId: z.string().cuid("Invalid child profile id")
});

export const childProfileSubjectsSchema = z.object({
  childId: z.string().cuid("Invalid child profile id"),
  subjectsNeedingSupport: z
    .array(nonEmptyString("Subject"), {
      required_error: "At least one subject is required"
    })
    .min(1, "At least one subject is required")
});

export type ChildProfileInput = z.infer<typeof childProfileSchema>;
export type UpdateChildProfileInput = z.infer<typeof updateChildProfileSchema>;
export type ChildProfileSubjectsInput = z.infer<typeof childProfileSubjectsSchema>;
