import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminSupportRequestWhereInput,
  buildParentSupportRequestWhereInput
} from "@/server/queries/support.queries";
import {
  buildCommunicationLogWhereInputForAssessment,
  buildCommunicationLogWhereInputForLesson,
  buildCommunicationLogWhereInputForParent,
  buildCommunicationLogWhereInputForPayment,
  buildCommunicationLogWhereInputForStudent,
  buildCommunicationLogWhereInputForSupportRequest
} from "@/server/queries/communication-log.queries";

describe("support request visibility filters", () => {
  test("parent support query only returns own requests", () => {
    assert.deepEqual(buildParentSupportRequestWhereInput("parent-user-id"), {
      parent: {
        userId: "parent-user-id"
      }
    });
  });

  test("parent support detail query includes request id and ownership", () => {
    assert.deepEqual(
      buildParentSupportRequestWhereInput("parent-user-id", "support-id"),
      {
        id: "support-id",
        parent: {
          userId: "parent-user-id"
        }
      }
    );
  });

  test("admin support query can filter by status and search", () => {
    assert.deepEqual(
      buildAdminSupportRequestWhereInput({
        status: "IN_REVIEW",
        search: "payment"
      }),
      {
        status: "IN_REVIEW",
        OR: [
          {
            subject: {
              contains: "payment",
              mode: "insensitive"
            }
          },
          {
            message: {
              contains: "payment",
              mode: "insensitive"
            }
          },
          {
            parent: {
              user: {
                name: {
                  contains: "payment",
                  mode: "insensitive"
                }
              }
            }
          },
          {
            parent: {
              user: {
                email: {
                  contains: "payment",
                  mode: "insensitive"
                }
              }
            }
          },
          {
            student: {
              fullName: {
                contains: "payment",
                mode: "insensitive"
              }
            }
          }
        ]
      }
    );
  });
});

describe("communication log admin filters", () => {
  test("communication log queries target a parent", () => {
    assert.deepEqual(buildCommunicationLogWhereInputForParent("parent-id"), {
      parentId: "parent-id"
    });
  });

  test("communication log queries target a student", () => {
    assert.deepEqual(buildCommunicationLogWhereInputForStudent("student-id"), {
      studentId: "student-id"
    });
  });

  test("communication log queries target an assessment", () => {
    assert.deepEqual(
      buildCommunicationLogWhereInputForAssessment("assessment-id"),
      {
        assessmentRequestId: "assessment-id"
      }
    );
  });

  test("communication log queries target a lesson", () => {
    assert.deepEqual(buildCommunicationLogWhereInputForLesson("lesson-id"), {
      lessonId: "lesson-id"
    });
  });

  test("communication log queries target a payment", () => {
    assert.deepEqual(buildCommunicationLogWhereInputForPayment("payment-id"), {
      paymentId: "payment-id"
    });
  });

  test("communication log queries target a support request", () => {
    assert.deepEqual(
      buildCommunicationLogWhereInputForSupportRequest("support-id"),
      {
        supportRequestId: "support-id"
      }
    );
  });
});
