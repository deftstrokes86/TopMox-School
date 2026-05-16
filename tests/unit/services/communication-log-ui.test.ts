import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildCommunicationLogTargetInput,
  canRenderCommunicationLogPanel,
  getCommunicationLogTypeMeta
} from "@/lib/utils/communication-log-ui";

describe("communication log UI targeting", () => {
  test("admin can add communication log to support request", () => {
    assert.deepEqual(
      buildCommunicationLogTargetInput("supportRequest", "support-id"),
      {
        supportRequestId: "support-id"
      }
    );
  });

  test("admin can add communication log to parent", () => {
    assert.deepEqual(buildCommunicationLogTargetInput("parent", "parent-id"), {
      parentId: "parent-id"
    });
  });

  test("admin can add communication log to student", () => {
    assert.deepEqual(buildCommunicationLogTargetInput("student", "student-id"), {
      studentId: "student-id"
    });
  });

  test("admin can add communication log to payment", () => {
    assert.deepEqual(buildCommunicationLogTargetInput("payment", "payment-id"), {
      paymentId: "payment-id"
    });
  });

  test("admin can add communication log to assessment", () => {
    assert.deepEqual(
      buildCommunicationLogTargetInput("assessment", "assessment-id"),
      {
        assessmentRequestId: "assessment-id"
      }
    );
  });

  test("admin can add communication log to lesson", () => {
    assert.deepEqual(buildCommunicationLogTargetInput("lesson", "lesson-id"), {
      lessonId: "lesson-id"
    });
  });

  test("parent and tutor cannot render internal communication log panel", () => {
    assert.equal(canRenderCommunicationLogPanel("ADMIN"), true);
    assert.equal(canRenderCommunicationLogPanel("PARENT"), false);
    assert.equal(canRenderCommunicationLogPanel("TUTOR"), false);
  });

  test("communication log type metadata uses operational labels", () => {
    assert.equal(getCommunicationLogTypeMeta("PAYMENT_FOLLOW_UP").label, "Payment Follow-Up");
    assert.equal(getCommunicationLogTypeMeta("ACADEMIC_FOLLOW_UP").label, "Academic Follow-Up");
  });
});
