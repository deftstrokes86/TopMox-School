import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminReportWhereInput,
  buildParentReportWhereInput,
  buildTutorReportWhereInput
} from "@/server/queries/report.queries";

describe("progress report visibility filters", () => {
  test("parent report query only returns published reports for own children", () => {
    assert.deepEqual(buildParentReportWhereInput("parent-user-id"), {
      parent: {
        userId: "parent-user-id"
      },
      status: "PUBLISHED"
    });
  });

  test("parent report detail query includes report id and published-only guard", () => {
    assert.deepEqual(
      buildParentReportWhereInput("parent-user-id", "report-id"),
      {
        id: "report-id",
        parent: {
          userId: "parent-user-id"
        },
        status: "PUBLISHED"
      }
    );
  });

  test("tutor report query returns only reports owned by the tutor profile", () => {
    assert.deepEqual(buildTutorReportWhereInput("tutor-user-id", "report-id"), {
      id: "report-id",
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });

  test("admin report query can filter by status, tutor, and student", () => {
    assert.deepEqual(
      buildAdminReportWhereInput({
        status: "REVIEW",
        tutorId: "tutor-profile-id",
        studentId: "student-id"
      }),
      {
        status: "REVIEW",
        tutorId: "tutor-profile-id",
        studentId: "student-id"
      }
    );
  });
});
