import type { NotificationType } from "@prisma/client";

import { db } from "@/lib/db";
import {
  createNotificationSchema,
  type CreateNotificationInput
} from "@/lib/validations/notification.schema";

type NotificationCreateInput = {
  data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    href?: string | null;
  };
  select?: {
    id: boolean;
  };
};

type NotificationCreateManyInput = {
  data: Array<NotificationCreateInput["data"]>;
};

type NotificationFindManyInput = {
  where: {
    userId: string;
    readAt?: null;
  };
  orderBy: {
    createdAt: "desc";
  };
  take: number;
};

type NotificationCountInput = {
  where: {
    userId: string;
    readAt: null;
  };
};

type NotificationUpdateManyInput = {
  where: {
    id?: string;
    userId: string;
    readAt: null;
  };
  data: {
    readAt: Date;
  };
};

export type NotificationServiceClient = {
  notification: {
    create?: (input: NotificationCreateInput) => Promise<{ id: string }>;
    createMany?: (
      input: NotificationCreateManyInput
    ) => Promise<{ count: number }>;
    findMany?: (input: NotificationFindManyInput) => Promise<unknown[]>;
    count?: (input: NotificationCountInput) => Promise<number>;
    updateMany?: (
      input: NotificationUpdateManyInput
    ) => Promise<{ count: number }>;
  };
  user?: {
    findMany: (input: {
      where: { role: "ADMIN" };
      select: { id: true };
    }) => Promise<Array<{ id: string }>>;
  };
};

export type GetUserNotificationsOptions = {
  take?: number;
  unreadOnly?: boolean;
};

export type MarkNotificationReadInput = {
  userId: string;
  notificationId: string;
  readAt?: Date;
};

function getClient(client?: NotificationServiceClient): NotificationServiceClient {
  return (client ?? db) as NotificationServiceClient;
}

function normalizeNotificationInput(input: CreateNotificationInput) {
  const parsed = createNotificationSchema.parse(input);

  return {
    userId: parsed.userId,
    type: parsed.type,
    title: parsed.title,
    message: parsed.message,
    href: parsed.href ?? null
  };
}

export async function createNotification(
  input: CreateNotificationInput,
  client?: NotificationServiceClient
) {
  const notificationClient = getClient(client);
  if (!notificationClient.notification.create) {
    throw new Error("Notification creation requires a create delegate.");
  }

  const data = normalizeNotificationInput(input);

  return notificationClient.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      href: data.href
    },
    select: {
      id: true
    }
  });
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[],
  client?: NotificationServiceClient
) {
  if (inputs.length === 0) {
    return { count: 0 };
  }

  const notificationClient = getClient(client);
  if (!notificationClient.notification.createMany) {
    throw new Error("Bulk notification creation requires a createMany delegate.");
  }

  const notifications = inputs.map(normalizeNotificationInput);

  return notificationClient.notification.createMany({
    data: notifications.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href
    }))
  });
}

export async function notifyAdmins(
  notification: Omit<CreateNotificationInput, "userId">,
  client?: NotificationServiceClient
) {
  const notificationClient = getClient(client);
  if (!notificationClient.user) {
    throw new Error("Notification admin lookup requires a user delegate.");
  }

  const admins = await notificationClient.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true }
  });

  return createBulkNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      ...notification
    })),
    notificationClient
  );
}

export async function getUserNotifications(
  userId: string,
  options: GetUserNotificationsOptions = {},
  client?: NotificationServiceClient
) {
  const notificationClient = getClient(client);
  if (!notificationClient.notification.findMany) {
    throw new Error("Notification lookup requires a findMany delegate.");
  }

  const take = options.take ?? 20;

  return notificationClient.notification.findMany({
    where: {
      userId,
      ...(options.unreadOnly ? { readAt: null } : {})
    },
    orderBy: { createdAt: "desc" },
    take
  });
}

export async function getUserUnreadNotificationCount(
  userId: string,
  client?: NotificationServiceClient
) {
  const notificationClient = getClient(client);
  if (!notificationClient.notification.count) {
    throw new Error("Notification unread count requires a count delegate.");
  }

  return notificationClient.notification.count({
    where: {
      userId,
      readAt: null
    }
  });
}

export async function markNotificationRead(
  input: MarkNotificationReadInput,
  client?: NotificationServiceClient
) {
  const notificationClient = getClient(client);
  if (!notificationClient.notification.updateMany) {
    throw new Error("Notification read update requires an updateMany delegate.");
  }

  const readAt = input.readAt ?? new Date();

  const result = await notificationClient.notification.updateMany({
    where: {
      id: input.notificationId,
      userId: input.userId,
      readAt: null
    },
    data: { readAt }
  });

  if (result.count === 0) {
    return {
      success: false,
      message: "Notification not found."
    } as const;
  }

  return {
    success: true,
    message: "Notification marked as read."
  } as const;
}

export async function markAllNotificationsRead(
  userId: string,
  client?: NotificationServiceClient,
  readAt: Date = new Date()
) {
  const notificationClient = getClient(client);
  if (!notificationClient.notification.updateMany) {
    throw new Error("Notification read update requires an updateMany delegate.");
  }

  return notificationClient.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: { readAt }
  });
}
