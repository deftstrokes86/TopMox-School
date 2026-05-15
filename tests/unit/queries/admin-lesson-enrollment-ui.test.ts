import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getDashboardRedirectPath } from "@/lib/auth/dashboard-access";
import { createLessonSchema } from "@/lib/validations/lesson.schema";
import { assignTutorToEnrollmentSchema } from "@/lib/validations/tutor.schema";
import { buildAdminEnrollmentWhereInput } from "@/server/queries/enrollment.queries";
import { buildAdminLessonWhereInput } from "@/server/queries/lesson.queries";

describe("admin enrollment assignment UI helpers", () => {
  test("admin enrollments page can filter active enrollments needing tutor assignment", () => {
    const where = buildAdminEnrollmentWhereInput({
      status: "ACTIVE",
      needsTutorAssignment: true
    });

    assert.equal(where.status, "ACTIVE");
    assert.equal(where.assignedTutorId, null);
  });

  test("assign tutor form requires a tutor", () => {
    const result = assignTutorToEnrollmentSchema.safeParse({
      enrollmentId: "enrollment-id"
    });

    assert.equal(result.success, false);
  });
});

describe("admin lesson scheduling UI helpers", () => {
  const validLessonInput = {
    enrollmentId: "enrollment-id",
    studentId: "student-id",
    tutorId: "tutor-id",
    subjectId: "subject-id",
    title: "Mathematics foundations",
    startTime: "2026-06-01T15:00:00.000Z",
    endTime: "2026-06-01T16:00:00.000Z",
    timezone: "Africa/Lagos",
    meetingLink: "https://meet.example.com/topmox"
  };

  test("lesson form requires start and end time", () => {
    const result = createLessonSchema.safeParse({
      ...validLessonInput,
      startTime: undefined,
      endTime: undefined
    });

    assert.equal(result.success, false);
  });

  test("lesson form rejects end time before start time", () => {
    const result = createLessonSchema.safeParse({
      ...validLessonInput,
      endTime: "2026-06-01T14:00:00.000Z"
    });

    assert.equal(result.success, false);
  });

  test("non-admin is redirected away from admin lesson scheduling route", () => {
    const redirectPath = getDashboardRedirectPath("ADMIN", {
      id: "parent-user-id",
      email: "parent@example.com",
      name: "Parent User",
      role: "PARENT"
    });

    assert.equal(redirectPath, "/parent");
  });

  test("scheduled lesson appears in admin lesson list filter with date range", () => {
    const where = buildAdminLessonWhereInput({
      status: "SCHEDULED",
      dateFrom: new Date("2026-06-01T00:00:00.000Z"),
      dateTo: new Date("2026-06-30T23:59:59.999Z")
    });

    assert.equal(where.status, "SCHEDULED");
    assert.deepEqual(where.startTime, {
      gte: new Date("2026-06-01T00:00:00.000Z"),
      lte: new Date("2026-06-30T23:59:59.999Z")
    });
  });
});
