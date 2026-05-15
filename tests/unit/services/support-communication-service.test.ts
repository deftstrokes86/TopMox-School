import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  SupportAccessError,
  SupportStatusTransitionError,
  assertCanCreateSupportRequest,
  assertParentCanLinkSupportRecord,
  assertSupportStatusTransition,
  canTransitionSupportStatus,
  getSupportSubmittedAdminNotificationPayload,
  getSupportUpdatedParentNotificationPayload
} from "@/server/services/support.service";
import {
  CommunicationLogAccessError,
  assertCanCreateCommunicationLog,
  assertCanReadCommunicationLogs,
  buildCommunicationLogLinkData,
  buildCommunicationLogWhereInputForEntity,
  getEntityCommunicationLogs
} from "@/server/services/communication-log.service";

describe("support request status transitions", () => {
  test("OPEN to IN_REVIEW is allowed", () => {
    assert.equal(canTransitionSupportStatus("OPEN", "IN_REVIEW"), true);
  });

  test("IN_REVIEW to RESOLVED is allowed", () => {
    assert.equal(canTransitionSupportStatus("IN_REVIEW", "RESOLVED"), true);
  });

  test("RESOLVED to CLOSED is allowed", () => {
    assert.equal(canTransitionSupportStatus("RESOLVED", "CLOSED"), true);
  });

  test("CLOSED to OPEN is admin-only", () => {
    assert.equal(
      canTransitionSupportStatus("CLOSED", "OPEN", { role: "PARENT" }),
      false
    );
    assert.equal(
      canTransitionSupportStatus("CLOSED", "OPEN", { role: "ADMIN" }),
      true
    );
    assert.throws(
      () => assertSupportStatusTransition("CLOSED", "OPEN", { role: "PARENT" }),
      SupportStatusTransitionError
    );
  });

  test("invalid support status transitions are blocked", () => {
    assert.equal(canTransitionSupportStatus("OPEN", "CLOSED"), false);
    assert.throws(
      () => assertSupportStatusTransition("OPEN", "CLOSED"),
      SupportStatusTransitionError
    );
  });
});

describe("support request access helpers", () => {
  test("parent can create support request", () => {
    assert.doesNotThrow(() => assertCanCreateSupportRequest("PARENT"));
  });

  test("tutor cannot create support request in this phase", () => {
    assert.throws(
      () => assertCanCreateSupportRequest("TUTOR"),
      SupportAccessError
    );
  });

  test("linked parent records must belong to the parent", () => {
    assert.doesNotThrow(() =>
      assertParentCanLinkSupportRecord({
        studentBelongsToParent: true,
        lessonBelongsToParent: true,
        paymentBelongsToParent: true,
        assessmentBelongsToParent: true
      })
    );

    assert.throws(
      () =>
        assertParentCanLinkSupportRecord({
          studentBelongsToParent: true,
          lessonBelongsToParent: false,
          paymentBelongsToParent: true,
          assessmentBelongsToParent: true
        }),
      SupportAccessError
    );
  });

  test("support notification payloads point to support queues", () => {
    const adminPayload =
      getSupportSubmittedAdminNotificationPayload("support-id");
    const parentPayload =
      getSupportUpdatedParentNotificationPayload("support-id");

    assert.equal(adminPayload.type, "SUPPORT_UPDATED");
    assert.match(adminPayload.href ?? "", /admin\/support\/support-id/);
    assert.equal(parentPayload.type, "SUPPORT_UPDATED");
    assert.match(parentPayload.href ?? "", /parent\/support\/support-id/);
  });
});

describe("communication log access and linking", () => {
  test("admin can create and read communication logs", () => {
    assert.doesNotThrow(() => assertCanCreateCommunicationLog("ADMIN"));
    assert.doesNotThrow(() => assertCanReadCommunicationLogs("ADMIN"));
  });

  test("parent and tutor cannot create internal communication logs", () => {
    assert.throws(
      () => assertCanCreateCommunicationLog("PARENT"),
      CommunicationLogAccessError
    );
    assert.throws(
      () => assertCanCreateCommunicationLog("TUTOR"),
      CommunicationLogAccessError
    );
  });

  test("parent cannot read internal communication logs by default", () => {
    assert.throws(
      () => assertCanReadCommunicationLogs("PARENT"),
      CommunicationLogAccessError
    );
  });

  test("communication log link data omits empty links", () => {
    assert.deepEqual(
      buildCommunicationLogLinkData({
        parentId: "parent-id",
        studentId: "",
        supportRequestId: "support-id"
      }),
      {
        parentId: "parent-id",
        supportRequestId: "support-id"
      }
    );
  });

  test("communication log where helper can target any linked entity", () => {
    assert.deepEqual(
      buildCommunicationLogWhereInputForEntity({
        paymentId: "payment-id"
      }),
      {
        paymentId: "payment-id"
      }
    );
  });

  test("admin can fetch communication logs for a linked entity", async () => {
    const calls: unknown[] = [];
    const logs = await getEntityCommunicationLogs(
      {
        communicationLog: {
          findMany: async (args) => {
            calls.push(args);

            return [{ id: "log-id" }];
          }
        }
      },
      {
        role: "ADMIN",
        where: { supportRequestId: "support-id" },
        take: 5
      }
    );

    assert.deepEqual(logs, [{ id: "log-id" }]);
    assert.deepEqual(calls, [
      {
        where: { supportRequestId: "support-id" },
        orderBy: { createdAt: "desc" },
        take: 5
      }
    ]);
  });
});
