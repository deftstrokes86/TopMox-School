import { z } from "zod";

export const emailSchema = z.string().email();

export const phoneSchema = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[+0-9()\-\s]+$/, "Invalid phone format");
