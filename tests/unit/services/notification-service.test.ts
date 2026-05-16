import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createBulkNotifications,
  createNotification,
  getUserNotifications,
  getUserUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  notifyAdmins
} from "@/server/services/notification.service";

describe("notification creation", () => {
  test("createNotification creates notification for a user", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        create: async (input: unknown) => {
          calls.push(input);
          return { id: "notification-id" };
        }
      }
    };

    const result = await createNotification(
      {
        userId: "user-id",
        type: "SUPPORT_UPDATED",
        title: "Support request updated",
        message: "TopMox has updated your support request.",
        href: "/parent/support/support-id"
      },
      client
    );

    assert.deepEqual(result, { id: "notification-id" });
    assert.deepEqual(calls, [
      {
        data: {
          userId: "user-id",
          type: "SUPPORT_UPDATED",
          title: "Support request updated",
          message: "TopMox has updated your support request.",
          href: "/parent/support/support-id"
        },
        select: { id: true }
      }
    ]);
  });

  test("createBulkNotifications creates notifications for multiple users", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        createMany: async (input: unknown) => {
          calls.push(input);
          return { count: 2 };
        }
      }
    };

    const result = await createBulkNotifications(
      [
        {
          userId: "first-admin",
          type: "PAYMENT_SUBMITTED",
          title: "Payment submitted",
          message: "A payment is awaiting review."
        },
        {
          userId: "second-admin",
          type: "PAYMENT_SUBMITTED",
          title: "Payment submitted",
          message: "A payment is awaiting review."
        }
      ],
      client
    );

    assert.deepEqual(result, { count: 2 });
    assert.equal(calls.length, 1);
  });

  test("notifyAdmins sends notification to all admin users", async () => {
    const createManyCalls: unknown[] = [];
    const client = {
      user: {
        findMany: async (input: unknown) => {
          assert.deepEqual(input, {
            where: { role: "ADMIN" },
            select: { id: true }
          });

          return [{ id: "admin-one" }, { id: "admin-two" }];
        }
      },
      notification: {
        createMany: async (input: unknown) => {
          createManyCalls.push(input);
          return { count: 2 };
        }
      }
    };

    const result = await notifyAdmins(
      {
        type: "LESSON_SCHEDULED",
        title: "Lesson scheduled",
        message: "A lesson has been scheduled.",
        href: "/admin/lessons/lesson-id"
      },
      client
    );

    assert.deepEqual(result, { count: 2 });
    assert.deepEqual(createManyCalls, [
      {
        data: [
          {
            userId: "admin-one",
            type: "LESSON_SCHEDULED",
            title: "Lesson scheduled",
            message: "A lesson has been scheduled.",
            href: "/admin/lessons/lesson-id"
          },
          {
            userId: "admin-two",
            type: "LESSON_SCHEDULED",
            title: "Lesson scheduled",
            message: "A lesson has been scheduled.",
            href: "/admin/lessons/lesson-id"
          }
        ]
      }
    ]);
  });
});

describe("notification access", () => {
  test("User can view own notifications", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        findMany: async (input: unknown) => {
          calls.push(input);
          return [{ id: "notification-id", userId: "user-id" }];
        }
      }
    };

    const notifications = await getUserNotifications("user-id", {}, client);

    assert.deepEqual(notifications, [
      { id: "notification-id", userId: "user-id" }
    ]);
    assert.deepEqual(calls, [
      {
        where: { userId: "user-id" },
        orderBy: { createdAt: "desc" },
        take: 20
      }
    ]);
  });

  test("User cannot view another user's notifications through user query", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        findMany: async (input: unknown) => {
          calls.push(input);
          return [];
        }
      }
    };

    await getUserNotifications("current-user-id", {}, client);

    assert.deepEqual(calls, [
      {
        where: { userId: "current-user-id" },
        orderBy: { createdAt: "desc" },
        take: 20
      }
    ]);
  });

  test("Admin cannot automatically read another user's notification through user notification query", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        findMany: async (input: unknown) => {
          calls.push(input);
          return [];
        }
      }
    };

    await getUserNotifications("admin-user-id", {}, client);

    assert.deepEqual(calls, [
      {
        where: { userId: "admin-user-id" },
        orderBy: { createdAt: "desc" },
        take: 20
      }
    ]);
  });
});

describe("notification read behavior", () => {
  test("User can mark own notification as read", async () => {
    const readAt = new Date("2026-05-16T10:00:00.000Z");
    const calls: unknown[] = [];
    const client = {
      notification: {
        updateMany: async (input: unknown) => {
          calls.push(input);
          return { count: 1 };
        }
      }
    };

    const result = await markNotificationRead(
      {
        userId: "user-id",
        notificationId: "notification-id",
        readAt
      },
      client
    );

    assert.equal(result.success, true);
    assert.deepEqual(calls, [
      {
        where: {
          id: "notification-id",
          userId: "user-id",
          readAt: null
        },
        data: { readAt }
      }
    ]);
  });

  test("User cannot mark another user's notification as read", async () => {
    const client = {
      notification: {
        updateMany: async () => ({ count: 0 })
      }
    };

    const result = await markNotificationRead(
      {
        userId: "current-user-id",
        notificationId: "other-user-notification"
      },
      client
    );

    assert.equal(result.success, false);
    assert.equal(result.message, "Notification not found.");
  });

  test("User can mark all own notifications as read", async () => {
    const readAt = new Date("2026-05-16T10:00:00.000Z");
    const calls: unknown[] = [];
    const client = {
      notification: {
        updateMany: async (input: unknown) => {
          calls.push(input);
          return { count: 3 };
        }
      }
    };

    const result = await markAllNotificationsRead("user-id", client, readAt);

    assert.deepEqual(result, { count: 3 });
    assert.deepEqual(calls, [
      {
        where: {
          userId: "user-id",
          readAt: null
        },
        data: { readAt }
      }
    ]);
  });

  test("Unread count only counts unread notifications for current user", async () => {
    const calls: unknown[] = [];
    const client = {
      notification: {
        count: async (input: unknown) => {
          calls.push(input);
          return 4;
        }
      }
    };

    const count = await getUserUnreadNotificationCount("user-id", client);

    assert.equal(count, 4);
    assert.deepEqual(calls, [
      {
        where: {
          userId: "user-id",
          readAt: null
        }
      }
    ]);
  });
});
