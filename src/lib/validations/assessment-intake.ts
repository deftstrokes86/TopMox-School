import { z } from "zod";

export const assessmentIntakeSchema = z.object({
  parentName: z.string().min(2),
  email: z.string().email(),
  whatsappNumber: z.string().min(7),
  childName: z.string().min(2),
  subjects: z.array(z.string()).min(1)
});

export type AssessmentIntakeInput = z.infer<typeof assessmentIntakeSchema>;
