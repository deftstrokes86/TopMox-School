import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createLessonSchema, updateLessonStatusSchema } from "@/lib/validations/lesson.schema";
import { assignTutorToEnrollmentSchema } from "@/lib/validations/tutor.schema";

const validCuid = "cm0validid00000123456789ab";

describe("tutor assignment validation", () => {
  test("requires enrollmentId", () => {
    const result = assignTutorToEnrollmentSchema.safeParse({
      tutorId: validCuid
    });

    assert.equal(result.success, false);
  });

  test("requires tutorId", () => {
    const result = assignTutorToEnrollmentSchema.safeParse({
      enrollmentId: validCuid
    });

    assert.equal(result.success, false);
  });

  test("accepts valid tutor assignment input", () => {
    const result = assignTutorToEnrollmentSchema.safeParse({
      enrollmentId: validCuid,
      tutorId: validCuid
    });

    assert.equal(result.success, true);
  });
});

describe("lesson validation", () => {
  const validLessonInput = {
    enrollmentId: validCuid,
    studentId: validCuid,
    tutorId: validCuid,
    subjectId: validCuid,
    title: "Mathematics foundations lesson",
    startTime: "2026-06-01T15:00:00.000Z",
    endTime: "2026-06-01T16:00:00.000Z",
    timezone: "Africa/Lagos",
    meetingLink: "https://meet.example.com/topmox"
  };

  test("requires core lesson fields", () => {
    const result = createLessonSchema.safeParse({});

    assert.equal(result.success, false);
  });

  test("requires end time after start time", () => {
    const result = createLessonSchema.safeParse({
      ...validLessonInput,
      endTime: "2026-06-01T14:30:00.000Z"
    });

    assert.equal(result.success, false);
  });

  test("rejects invalid meeting link", () => {
    const result = createLessonSchema.safeParse({
      ...validLessonInput,
      meetingLink: "not-a-url"
    });

    assert.equal(result.success, false);
  });

  test("accepts valid lesson input", () => {
    const result = createLessonSchema.safeParse(validLessonInput);

    assert.equal(result.success, true);
  });

  test("requires lesson status update fields", () => {
    const result = updateLessonStatusSchema.safeParse({});

    assert.equal(result.success, false);
  });
});
