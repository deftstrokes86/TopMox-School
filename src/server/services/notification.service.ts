import type { NotificationType } from "@prisma/client";

import { db } from "@/lib/db";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null
    },
    select: {
      id: true
    }
  });
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
) {
  if (inputs.length === 0) {
    return { count: 0 };
  }

  return db.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null
    }))
  });
}

export async function notifyAdmins(
  notification: Omit<CreateNotificationInput, "userId">
) {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true }
  });

  return createBulkNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      ...notification
    }))
  );
}
