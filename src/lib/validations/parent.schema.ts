import { z } from "zod";

import { emailSchema, phoneSchema } from "./base";

export const preferredContactMethodSchema = z.enum(["EMAIL", "WHATSAPP", "PHONE"], {
  required_error: "Preferred contact method is required"
});

export const parentProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: emailSchema,
  whatsappNumber: phoneSchema.min(7, "WhatsApp number is required"),
  country: z.string().trim().min(2, "Country is required"),
  timezone: z.string().trim().min(1, "Timezone is required"),
  preferredContactMethod: preferredContactMethodSchema,
  heardAboutTopMox: z
    .string()
    .trim()
    .min(2, "Tell us how you heard about TopMox")
    .optional()
    .or(z.literal(""))
});

export type ParentProfileInput = z.infer<typeof parentProfileSchema>;
