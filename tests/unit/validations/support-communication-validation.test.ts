import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createSupportRequestSchema,
  updateSupportRequestSchema
} from "@/lib/validations/support.schema";
import { createCommunicationLogSchema } from "@/lib/validations/communication-log.schema";

const validSupportRequest = {
  subject: "Payment question",
  message: "I need help understanding the next payment step.",
  studentId: "cmSupportStudent01",
  lessonId: "cmSupportLesson01",
  paymentId: "cmSupportPayment01",
  assessmentRequestId: "cmSupportAssessment01"
};

describe("support request validation", () => {
  test("support request requires subject", () => {
    const result = createSupportRequestSchema.safeParse({
      ...validSupportRequest,
      subject: ""
    });

    assert.equal(result.success, false);
  });

  test("support request requires message", () => {
    const result = createSupportRequestSchema.safeParse({
      ...validSupportRequest,
      message: ""
    });

    assert.equal(result.success, false);
  });

  test("support update requires a valid status", () => {
    const invalid = updateSupportRequestSchema.safeParse({
      supportRequestId: "cmSupportRequest01",
      status: "ESCALATED",
      adminReply: "We are reviewing this."
    });
    const valid = updateSupportRequestSchema.safeParse({
      supportRequestId: "cmSupportRequest01",
      status: "IN_REVIEW"
    });

    assert.equal(invalid.success, false);
    assert.equal(valid.success, true);
  });

  test("admin reply is optional", () => {
    const result = updateSupportRequestSchema.safeParse({
      supportRequestId: "cmSupportRequest01",
      status: "RESOLVED"
    });

    assert.equal(result.success, true);
  });
});

describe("communication log validation", () => {
  test("communication log requires a valid type", () => {
    const invalid = createCommunicationLogSchema.safeParse({
      type: "SMS",
      message: "Sent a parent update.",
      parentId: "cmParent01"
    });
    const valid = createCommunicationLogSchema.safeParse({
      type: "WHATSAPP",
      message: "Sent a parent update.",
      parentId: "cmParent01"
    });

    assert.equal(invalid.success, false);
    assert.equal(valid.success, true);
  });

  test("communication log requires message", () => {
    const result = createCommunicationLogSchema.safeParse({
      type: "INTERNAL_NOTE",
      message: "",
      supportRequestId: "cmSupportRequest01"
    });

    assert.equal(result.success, false);
  });

  test("communication log can link to operational records", () => {
    const result = createCommunicationLogSchema.safeParse({
      type: "ACADEMIC_FOLLOW_UP",
      message: "Admin called parent about lesson progress.",
      parentId: "cmParent01",
      studentId: "cmStudent01",
      assessmentRequestId: "cmAssessment01",
      lessonId: "cmLesson01",
      paymentId: "cmPayment01",
      supportRequestId: "cmSupport01"
    });

    assert.equal(result.success, true);
  });
});
