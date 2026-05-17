import { ResourceStatus } from "@prisma/client";
import { z } from "zod";

const resourceStatusSchema = z.nativeEnum(ResourceStatus);

const resourceSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase and URL-safe."
  );

const resourceContentFields = {
  title: z.string().trim().min(1, "Title is required."),
  slug: resourceSlugSchema,
  excerpt: z.string().trim().min(1, "Excerpt is required."),
  content: z.string().trim().min(1, "Content is required."),
  category: z.string().trim().min(1, "Category is required.")
};

export const createResourceSchema = z.object({
  ...resourceContentFields,
  status: resourceStatusSchema.optional()
});

export const updateResourceSchema = z.object({
  resourceId: z.string().trim().min(1, "Resource is required."),
  ...resourceContentFields,
  status: resourceStatusSchema
});

export const updateResourceStatusSchema = z.object({
  resourceId: z.string().trim().min(1, "Resource is required."),
  status: resourceStatusSchema
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type UpdateResourceStatusInput = z.infer<
  typeof updateResourceStatusSchema
>;
