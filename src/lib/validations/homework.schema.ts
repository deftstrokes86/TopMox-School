import { z } from "zod";

const idSchema = (label: string) => z.string().min(1, `${label} is required`);

const optionalDueDateSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.coerce.date({ invalid_type_error: "Due date must be a valid date" }).optional());

export const assignHomeworkSchema = z.object({
  lessonId: idSchema("Lesson"),
  title: z.string().trim().min(1, "Homework title is required"),
  description: z.string().trim().min(1, "Homework description is required"),
  dueDate: optionalDueDateSchema
});

export type AssignHomeworkInput = z.infer<typeof assignHomeworkSchema>;
