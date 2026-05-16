import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminSupportStatusOptions,
  getSupportStatusMeta,
  shapeParentSupportRequestDetail
} from "@/lib/utils/support-ui";

describe("support UI status helpers", () => {
  test("support request status transitions obey UI-visible rules", () => {
    assert.deepEqual(buildAdminSupportStatusOptions("OPEN"), ["IN_REVIEW"]);
    assert.deepEqual(buildAdminSupportStatusOptions("IN_REVIEW"), ["RESOLVED"]);
    assert.deepEqual(buildAdminSupportStatusOptions("RESOLVED"), ["CLOSED"]);
    assert.deepEqual(buildAdminSupportStatusOptions("CLOSED"), ["OPEN"]);
  });

  test("support status metadata is parent and admin friendly", () => {
    assert.equal(getSupportStatusMeta("OPEN").label, "Open");
    assert.equal(getSupportStatusMeta("IN_REVIEW").tone, "info");
    assert.match(
      getSupportStatusMeta("RESOLVED").parentDescription,
      /resolved/i
    );
  });
});

describe("parent support visibility shaping", () => {
  test("parent support detail excludes internal communication logs", () => {
    const shaped = shapeParentSupportRequestDetail({
      id: "support-id",
      subject: "Payment question",
      message: "I need help with payment.",
      adminReply: "TopMox has reviewed this.",
      status: "RESOLVED",
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-15T10:00:00.000Z"),
      communicationLogs: [
        {
          id: "log-id",
          message: "Internal WhatsApp follow-up",
          type: "WHATSAPP"
        }
      ]
    });

    assert.equal(shaped.id, "support-id");
    assert.equal(shaped.adminReply, "TopMox has reviewed this.");
    assert.equal("communicationLogs" in shaped, false);
  });
});
