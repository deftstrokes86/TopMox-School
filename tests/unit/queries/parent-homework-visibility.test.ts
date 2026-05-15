import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildParentHomeworkWhereInput,
  buildParentHomeworkListItem
} from "@/server/queries/homework.queries";
import { getParentLessonVisibilitySummary } from "@/lib/utils/parent-lesson-visibility";

describe("parent homework visibility", () => {
  test("parent homework queries are scoped to the current parent's children", () => {
    assert.deepEqual(buildParentHomeworkWhereInput("parent-user-id"), {
      student: {
        parent: {
          userId: "parent-user-id"
        }
      }
    });
  });

  test("parent cannot see another parent's homework by id", () => {
    assert.deepEqual(
      buildParentHomeworkWhereInput("parent-user-id", "homework-id"),
      {
        id: "homework-id",
        student: {
          parent: {
            userId: "parent-user-id"
          }
        }
      }
    );
  });

  test("parent homework list item includes child, tutor, lesson, and subject context", () => {
    const item = buildParentHomeworkListItem({
      id: "homework-1",
      title: "Fractions practice",
      description: "Complete questions 1 to 10.",
      dueDate: new Date("2026-06-03T00:00:00.000Z"),
      status: "ASSIGNED",
      createdAt: new Date("2026-06-01T11:10:00.000Z"),
      updatedAt: new Date("2026-06-01T11:10:00.000Z"),
      student: {
        fullName: "Amara Okafor"
      },
      lesson: {
        id: "lesson-1",
        title: "Mathematics foundations",
        subject: {
          name: "Mathematics"
        },
        tutor: {
          user: {
            name: "Tutor User"
          }
        }
      }
    });

    assert.equal(item.childName, "Amara Okafor");
    assert.equal(item.tutorName, "Tutor User");
    assert.equal(item.subjectName, "Mathematics");
    assert.equal(item.lessonHref, "/parent/lessons/lesson-1");
  });
});

describe("parent dashboard lesson and homework visibility", () => {
  test("shows recent completed lesson note and homework count", () => {
    const summary = getParentLessonVisibilitySummary(
      [
        {
          id: "old-lesson",
          title: "Old lesson",
          status: "COMPLETED",
          startTime: new Date("2026-05-01T10:00:00.000Z"),
          lessonNotes: "Older note",
          student: {
            fullName: "Amara"
          },
          subject: {
            name: "English"
          }
        },
        {
          id: "recent-lesson",
          title: "Recent lesson",
          status: "COMPLETED",
          startTime: new Date("2026-05-14T10:00:00.000Z"),
          lessonNotes: "Recent parent-safe lesson note.",
          student: {
            fullName: "Amara"
          },
          subject: {
            name: "Mathematics"
          }
        }
      ],
      [
        {
          id: "homework-1",
          title: "Fractions practice",
          status: "ASSIGNED",
          dueDate: new Date("2026-05-16T00:00:00.000Z")
        },
        {
          id: "homework-2",
          title: "Reviewed reading",
          status: "REVIEWED",
          dueDate: new Date("2026-05-17T00:00:00.000Z")
        }
      ]
    );

    assert.equal(summary.recentLessonNote?.lessonId, "recent-lesson");
    assert.equal(summary.recentLessonNote?.lessonNotes, "Recent parent-safe lesson note.");
    assert.equal(summary.homeworkAssignedCount, 1);
    assert.equal(summary.nextHomeworkDue?.id, "homework-1");
  });
});
