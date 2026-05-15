import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  TutorAssignmentError,
  assertTutorCanBeAssigned,
  getParentTutorAssignedNotificationPayload,
  getTutorAssignedNotificationPayload,
  validateTutorAssignment
} from "@/server/services/tutor-assignment.service";
import {
  LessonSchedulingError,
  LessonStatusTransitionError,
  assertEnrollmentCanReceiveLessons,
  assertLessonStatusTransition,
  assertLessonTimeIsValid,
  canTransitionLessonStatus,
  getLessonScheduledNotificationPayloads,
  validateLessonScheduling
} from "@/server/services/lesson.service";

const validTutorAssignment = {
  currentRole: "ADMIN" as const,
  enrollmentStatus: "ACTIVE" as const,
  tutorExists: true,
  tutorUserRole: "TUTOR" as const,
  tutorStatus: "ACTIVE" as const
};

describe("tutor assignment guard", () => {
  test("admin can assign tutor to active enrollment", () => {
    const result = validateTutorAssignment(validTutorAssignment);

    assert.equal(result.success, true);
  });

  test("admin cannot assign tutor to pending payment enrollment", () => {
    const result = validateTutorAssignment({
      ...validTutorAssignment,
      enrollmentStatus: "PENDING_PAYMENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Enrollment must be active before assigning a tutor.");
  });

  test("non-admin cannot assign tutor", () => {
    const result = validateTutorAssignment({
      ...validTutorAssignment,
      currentRole: "PARENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Only admins can assign tutors.");
  });

  test("assigned tutor must exist and have tutor role/profile", () => {
    const missingTutor = validateTutorAssignment({
      ...validTutorAssignment,
      tutorExists: false
    });
    const wrongRole = validateTutorAssignment({
      ...validTutorAssignment,
      tutorUserRole: "PARENT"
    });

    assert.equal(missingTutor.success, false);
    assert.equal(wrongRole.success, false);
    assert.equal(wrongRole.fieldErrors?.tutorId, "Choose an active tutor.");
  });

  test("paused or inactive tutors cannot be assigned", () => {
    assert.throws(
      () =>
        assertTutorCanBeAssigned({
          tutorExists: true,
          tutorUserRole: "TUTOR",
          tutorStatus: "PAUSED"
        }),
      TutorAssignmentError
    );
  });

  test("tutor assignment notifications target parent and tutor dashboards", () => {
    const parentPayload = getParentTutorAssignedNotificationPayload("enrollment-id");
    const tutorPayload = getTutorAssignedNotificationPayload("enrollment-id");

    assert.equal(parentPayload.type, "TUTOR_ASSIGNED");
    assert.match(parentPayload.href ?? "", /parent\/enrollments/);
    assert.equal(tutorPayload.type, "TUTOR_ASSIGNED");
    assert.match(tutorPayload.href ?? "", /tutor\/students/);
  });
});

describe("lesson status transitions", () => {
  test("scheduled lesson can become completed, cancelled, rescheduled, or missed", () => {
    assert.equal(canTransitionLessonStatus("SCHEDULED", "COMPLETED"), true);
    assert.equal(canTransitionLessonStatus("SCHEDULED", "CANCELLED"), true);
    assert.equal(canTransitionLessonStatus("SCHEDULED", "RESCHEDULED"), true);
    assert.equal(canTransitionLessonStatus("SCHEDULED", "MISSED"), true);
  });

  test("rescheduled lesson can become scheduled or cancelled", () => {
    assert.equal(canTransitionLessonStatus("RESCHEDULED", "SCHEDULED"), true);
    assert.equal(canTransitionLessonStatus("RESCHEDULED", "CANCELLED"), true);
  });

  test("cancelled and completed lessons cannot move to final statuses", () => {
    assert.equal(canTransitionLessonStatus("CANCELLED", "COMPLETED"), false);
    assert.equal(canTransitionLessonStatus("COMPLETED", "CANCELLED"), false);
    assert.throws(
      () => assertLessonStatusTransition("CANCELLED", "COMPLETED"),
      LessonStatusTransitionError
    );
  });
});

describe("lesson scheduling guard", () => {
  const validScheduling = {
    currentRole: "ADMIN" as const,
    enrollmentStatus: "ACTIVE" as const,
    enrollmentParentId: "parent-profile-id",
    enrollmentStudentId: "student-id",
    requestedStudentId: "student-id",
    assignedTutorId: "tutor-id",
    requestedTutorId: "tutor-id",
    tutorExists: true,
    tutorStatus: "ACTIVE" as const,
    subjectExists: true
  };

  test("admin can schedule lesson for active enrollment", () => {
    const result = validateLessonScheduling(validScheduling);

    assert.equal(result.success, true);
  });

  test("admin cannot schedule lesson for pending payment enrollment", () => {
    const result = validateLessonScheduling({
      ...validScheduling,
      enrollmentStatus: "PENDING_PAYMENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Enrollment must be active before scheduling lessons.");
  });

  test("non-admin cannot schedule lesson in Phase 8A", () => {
    const result = validateLessonScheduling({
      ...validScheduling,
      currentRole: "PARENT"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.enrollmentId, "Only admins can schedule lessons.");
  });

  test("lesson student must match enrollment student", () => {
    const result = validateLessonScheduling({
      ...validScheduling,
      requestedStudentId: "other-student-id"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.studentId, "Student must belong to the selected enrollment.");
  });

  test("lesson tutor must exist and be active", () => {
    const result = validateLessonScheduling({
      ...validScheduling,
      tutorStatus: "INACTIVE"
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.tutorId, "Choose an active tutor.");
  });

  test("lesson subject must exist", () => {
    const result = validateLessonScheduling({
      ...validScheduling,
      subjectExists: false
    });

    assert.equal(result.success, false);
    assert.equal(result.fieldErrors?.subjectId, "Choose a supported subject.");
  });

  test("active enrollment can receive lessons", () => {
    assert.doesNotThrow(() => assertEnrollmentCanReceiveLessons("ACTIVE"));
    assert.throws(
      () => assertEnrollmentCanReceiveLessons("PENDING_PAYMENT"),
      LessonSchedulingError
    );
  });

  test("lesson end time must be after start time", () => {
    assert.doesNotThrow(() =>
      assertLessonTimeIsValid(
        new Date("2026-06-01T15:00:00.000Z"),
        new Date("2026-06-01T16:00:00.000Z")
      )
    );
    assert.throws(
      () =>
        assertLessonTimeIsValid(
          new Date("2026-06-01T16:00:00.000Z"),
          new Date("2026-06-01T15:00:00.000Z")
        ),
      LessonSchedulingError
    );
  });

  test("lesson scheduled notifications are parent and tutor ready", () => {
    const payloads = getLessonScheduledNotificationPayloads("lesson-id");

    assert.equal(payloads.parent.type, "LESSON_SCHEDULED");
    assert.match(payloads.parent.href ?? "", /parent\/lessons/);
    assert.equal(payloads.tutor.type, "LESSON_SCHEDULED");
    assert.match(payloads.tutor.href ?? "", /tutor\/lessons/);
  });
});
