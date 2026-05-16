import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createNotificationSchema,
  markNotificationReadSchema
} from "@/lib/validations/notification.schema";

describe("notification validation schemas", () => {
  test("notification requires title, message, type, and userId", () => {
    const result = createNotificationSchema.safeParse({});

    assert.equal(result.success, false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      assert.ok(errors.userId?.length);
      assert.ok(errors.type?.length);
      assert.ok(errors.title?.length);
      assert.ok(errors.message?.length);
    }
  });

  test("notification accepts an optional href", () => {
    const result = createNotificationSchema.safeParse({
      userId: "user-id",
      type: "SUPPORT_UPDATED",
      title: "Support request updated",
      message: "TopMox has updated your support request.",
      href: "/parent/support/support-id"
    });

    assert.equal(result.success, true);
  });

  test("mark notification read requires notificationId", () => {
    const result = markNotificationReadSchema.safeParse({});

    assert.equal(result.success, false);

    if (!result.success) {
      assert.ok(result.error.flatten().fieldErrors.notificationId?.length);
    }
  });
});
