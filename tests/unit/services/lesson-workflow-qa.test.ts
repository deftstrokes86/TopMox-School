import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  canScheduleLessonsForEnrollment,
  getAdminLessonStatusActions,
  getLessonSchedulingUnavailableMessage
} from "@/lib/utils/lesson-workflow";

describe("lesson scheduling workflow QA", () => {
  test("lesson scheduling controls are available only for active enrollments", () => {
    assert.equal(canScheduleLessonsForEnrollment("ACTIVE"), true);
    assert.equal(canScheduleLessonsForEnrollment("PENDING_PAYMENT"), false);
    assert.equal(canScheduleLessonsForEnrollment("PAUSED"), false);
    assert.equal(canScheduleLessonsForEnrollment("CANCELLED"), false);
    assert.equal(canScheduleLessonsForEnrollment("COMPLETED"), false);
  });

  test("inactive enrollment scheduling message points admin to activation first", () => {
    assert.match(
      getLessonSchedulingUnavailableMessage("PENDING_PAYMENT"),
      /payment activation/i
    );
    assert.match(
      getLessonSchedulingUnavailableMessage("PAUSED"),
      /active/i
    );
  });
});

describe("admin lesson status action QA", () => {
  test("scheduled lessons expose only valid admin status actions", () => {
    assert.deepEqual(
      getAdminLessonStatusActions("SCHEDULED").map((action) => action.status),
      ["RESCHEDULED", "CANCELLED", "MISSED", "COMPLETED"]
    );
  });

  test("cancelled and completed lessons expose no final-state actions", () => {
    assert.deepEqual(getAdminLessonStatusActions("CANCELLED"), []);
    assert.deepEqual(getAdminLessonStatusActions("COMPLETED"), []);
  });
});
