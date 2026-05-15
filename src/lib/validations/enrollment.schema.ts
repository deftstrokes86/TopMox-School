import { z } from "zod";

const cuidSchema = (fieldLabel: string) =>
  z.string().cuid(`${fieldLabel} is invalid`);

export const acceptRecommendedPlanSchema = z.object({
  assessmentRequestId: cuidSchema("Assessment request"),
  recommendedPlanId: cuidSchema("Recommended plan")
});

export type AcceptRecommendedPlanInput = z.infer<
  typeof acceptRecommendedPlanSchema
>;
