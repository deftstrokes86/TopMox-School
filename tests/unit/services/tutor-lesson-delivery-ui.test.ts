import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getTutorLessonDeliveryPanelState,
  getTutorLessonWorkSummary
} from "@/lib/utils/tutor-lesson-delivery";
import { assignHomeworkSchema } from "@/lib/validations/homework.schema";
import { completeTutorLessonSchema } from "@/lib/validations/lesson.schema";

describe("tutor lesson delivery panel state", () => {
  test("assigned scheduled lesson shows completion and homework forms", () => {
    const state = getTutorLessonDeliveryPanelState({
      isAssignedTutor: true,
      lessonStatus: "SCHEDULED"
    });

    assert.equal(state.canShowCompletionForm, true);
    assert.equal(state.canAssignHomework, true);
    assert.equal(state.showReadOnlyCompletionSummary, false);
  });

  test("unassigned lesson hides completion and homework forms", () => {
    const state = getTutorLessonDeliveryPanelState({
      isAssignedTutor: false,
      lessonStatus: "SCHEDULED"
    });

    assert.equal(state.canShowCompletionForm, false);
    assert.equal(state.canAssignHomework, false);
  });

  test("completed lesson shows read-only completion summary", () => {
    const state = getTutorLessonDeliveryPanelState({
      isAssignedTutor: true,
      lessonStatus: "COMPLETED"
    });

    assert.equal(state.canShowCompletionForm, false);
    assert.equal(state.showReadOnlyCompletionSummary, true);
  });
});

describe("tutor lesson completion validation", () => {
  test("requires attendance", () => {
    const result = completeTutorLessonSchema.safeParse({
      lessonId: "lesson-id",
      lessonNotes: "Covered fractions and simplification."
    });

    assert.equal(result.success, false);
  });

  test("requires concern note when concern flag is selected", () => {
    const result = completeTutorLessonSchema.safeParse({
      lessonId: "lesson-id",
      attended: true,
      concernFlag: true,
      concernNote: ""
    });

    assert.equal(result.success, false);
  });

  test("accepts valid lesson completion input", () => {
    const result = completeTutorLessonSchema.safeParse({
      lessonId: "lesson-id",
      attended: true,
      lessonNotes: "Student handled examples well after guided practice.",
      concernFlag: false
    });

    assert.equal(result.success, true);
  });
});

describe("homework assignment validation", () => {
  test("requires homework title and description", () => {
    const missingTitle = assignHomeworkSchema.safeParse({
      lessonId: "lesson-id",
      description: "Complete the worksheet questions."
    });
    const missingDescription = assignHomeworkSchema.safeParse({
      lessonId: "lesson-id",
      title: "Fractions worksheet"
    });

    assert.equal(missingTitle.success, false);
    assert.equal(missingDescription.success, false);
  });

  test("accepts valid homework assignment input", () => {
    const result = assignHomeworkSchema.safeParse({
      lessonId: "lesson-id",
      title: "Fractions worksheet",
      description: "Complete questions 1 to 10 before the next lesson.",
      dueDate: "2026-06-03"
    });

    assert.equal(result.success, true);
  });
});

describe("tutor lesson dashboard work summary", () => {
  test("counts lessons needing notes, completed lessons, and assigned homework", () => {
    const summary = getTutorLessonWorkSummary(
      [
        {
          id: "scheduled-past",
          status: "SCHEDULED",
          startTime: new Date("2026-05-14T10:00:00.000Z")
        },
        {
          id: "rescheduled-future",
          status: "RESCHEDULED",
          startTime: new Date("2026-05-16T10:00:00.000Z")
        },
        {
          id: "completed",
          status: "COMPLETED",
          startTime: new Date("2026-05-10T10:00:00.000Z")
        }
      ],
      [
        {
          id: "homework-1",
          status: "ASSIGNED"
        },
        {
          id: "homework-2",
          status: "REVIEWED"
        }
      ],
      new Date("2026-05-15T12:00:00.000Z")
    );

    assert.equal(summary.lessonsNeedingNotes, 1);
    assert.equal(summary.upcomingLessons, 1);
    assert.equal(summary.recentlyCompletedLessons, 1);
    assert.equal(summary.activeHomework, 1);
  });
});
