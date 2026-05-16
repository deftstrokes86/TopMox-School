import { NotificationType } from "@prisma/client";
import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().trim().min(1, "User is required."),
  type: z.nativeEnum(NotificationType, {
    required_error: "Notification type is required.",
    invalid_type_error: "Choose a valid notification type."
  }),
  title: z.string().trim().min(1, "Notification title is required."),
  message: z.string().trim().min(1, "Notification message is required."),
  href: z
    .string()
    .trim()
    .min(1, "Notification link cannot be empty.")
    .nullable()
    .optional()
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().trim().min(1, "Notification is required.")
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkNotificationReadInput = z.infer<
  typeof markNotificationReadSchema
>;
