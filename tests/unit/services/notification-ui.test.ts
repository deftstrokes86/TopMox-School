import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildNotificationCenterModel,
  buildNotificationDropdownModel,
  canShowMarkAsReadAction,
  getMarkAllNotificationsScope,
  getNotificationCenterHref
} from "@/lib/utils/notification-ui";

const notifications = [
  {
    id: "own-unread",
    userId: "current-user",
    type: "LESSON_SCHEDULED" as const,
    title: "A lesson has been scheduled.",
    message: "Your next lesson is ready to view.",
    href: "/parent/lessons/lesson-id",
    readAt: null,
    createdAt: new Date("2026-05-16T09:00:00.000Z")
  },
  {
    id: "other-user",
    userId: "other-user",
    type: "PAYMENT_APPROVED" as const,
    title: "Payment approved.",
    message: "This belongs to another user.",
    href: "/parent/payments/payment-id",
    readAt: null,
    createdAt: new Date("2026-05-16T08:00:00.000Z")
  },
  {
    id: "own-read",
    userId: "current-user",
    type: "REPORT_PUBLISHED" as const,
    title: "Progress report ready.",
    message: "Review the latest learning update.",
    href: "/parent/reports/report-id",
    readAt: new Date("2026-05-16T10:00:00.000Z"),
    createdAt: new Date("2026-05-15T08:00:00.000Z")
  }
];

describe("notification dropdown UI model", () => {
  test("Notification dropdown shows current user notifications", () => {
    const model = buildNotificationDropdownModel({
      currentUserId: "current-user",
      role: "PARENT",
      notifications,
      unreadCount: 1
    });

    assert.deepEqual(
      model.items.map((item) => item.id),
      ["own-unread", "own-read"]
    );
  });

  test("Notification dropdown does not show another user's notifications", () => {
    const model = buildNotificationDropdownModel({
      currentUserId: "current-user",
      role: "PARENT",
      notifications,
      unreadCount: 1
    });

    assert.equal(
      model.items.some((item) => item.id === "other-user"),
      false
    );
  });

  test("Unread count displays correctly", () => {
    const model = buildNotificationDropdownModel({
      currentUserId: "current-user",
      role: "ADMIN",
      notifications,
      unreadCount: 12
    });

    assert.equal(model.unreadCountLabel, "12");
    assert.equal(model.hasUnread, true);
    assert.equal(model.centerHref, "/admin/notifications");
  });

  test("Clicking mark as read is visible only for current user's unread notification", () => {
    assert.equal(
      canShowMarkAsReadAction(notifications[0], "current-user"),
      true
    );
    assert.equal(
      canShowMarkAsReadAction(notifications[1], "current-user"),
      false
    );
    assert.equal(
      canShowMarkAsReadAction(notifications[2], "current-user"),
      false
    );
  });

  test("Mark all as read is scoped to the current user only", () => {
    assert.deepEqual(getMarkAllNotificationsScope("current-user"), {
      userId: "current-user"
    });
  });
});

describe("notification center UI model", () => {
  test("Notification center lists notifications for current user", () => {
    const model = buildNotificationCenterModel({
      currentUserId: "current-user",
      role: "TUTOR",
      notifications,
      unreadCount: 1
    });

    assert.deepEqual(
      model.items.map((item) => item.id),
      ["own-unread", "own-read"]
    );
    assert.equal(model.centerHref, "/tutor/notifications");
  });

  test("Empty state appears when no notifications exist", () => {
    const model = buildNotificationCenterModel({
      currentUserId: "current-user",
      role: "PARENT",
      notifications: [],
      unreadCount: 0
    });

    assert.equal(model.isEmpty, true);
    assert.equal(
      model.emptyStateDescription,
      "Updates about assessments, payments, lessons, homework, reports, and support will appear here."
    );
  });

  test("role notification center hrefs point to each dashboard area", () => {
    assert.equal(getNotificationCenterHref("ADMIN"), "/admin/notifications");
    assert.equal(getNotificationCenterHref("PARENT"), "/parent/notifications");
    assert.equal(getNotificationCenterHref("TUTOR"), "/tutor/notifications");
  });
});
