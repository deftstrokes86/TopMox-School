import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminHomeworkListItem,
  buildAdminHomeworkWhereInput
} from "@/server/queries/homework.queries";
import {
  buildAdminLessonDeliveryView,
  buildAdminLessonDeliveryWhereInput,
  buildParentLessonDetailView,
  buildTutorLessonWhereInput
} from "@/server/queries/lesson.queries";
import { getAdminLessonDeliveryDashboardSummary } from "@/lib/utils/admin-lesson-delivery";

const completedLesson = {
  id: "lesson-1",
  title: "Mathematics foundations",
  startTime: new Date("2026-06-01T10:00:00.000Z"),
  endTime: new Date("2026-06-01T11:00:00.000Z"),
  timezone: "Africa/Lagos",
  meetingLink: "https://meet.example.com/topmox",
  status: "COMPLETED" as const,
  lessonNotes: "Student completed fraction examples with guided support.",
  concernFlag: true,
  concernNote: "Needs admin follow-up on multiplication confidence.",
  attended: true,
  attendanceMarkedAt: new Date("2026-06-01T11:05:00.000Z"),
  parent: {
    country: "Nigeria",
    timezone: "Africa/Lagos",
    user: {
      name: "Parent User",
      email: "parent@example.com"
    }
  },
  student: {
    fullName: "Amara Okafor",
    age: 10,
    classYearGroup: "Primary 5",
    countryOfStudy: "Nigeria",
    curriculum: "British-Nigerian blend",
    mainAcademicChallenge: "Needs stronger number confidence",
    academicGoal: "Build confidence before exams"
  },
  tutor: {
    user: {
      name: "Tutor User"
    }
  },
  subject: {
    name: "Mathematics"
  },
  enrollment: {
    id: "enrollment-1",
    status: "ACTIVE" as const,
    tutoringPlan: {
      name: "Growth Plan",
      sessionsPerWeek: 3
    }
  },
  homework: [
    {
      id: "homework-1",
      title: "Fractions practice",
      description: "Complete questions 1 to 10 before the next lesson.",
      dueDate: new Date("2026-06-03T00:00:00.000Z"),
      status: "ASSIGNED" as const,
      createdAt: new Date("2026-06-01T11:10:00.000Z"),
      updatedAt: new Date("2026-06-01T11:10:00.000Z")
    }
  ]
};

describe("admin lesson delivery visibility", () => {
  test("admin can see all completed lesson notes and internal concern details", () => {
    const view = buildAdminLessonDeliveryView(completedLesson);

    assert.equal(view.delivery.lessonNotes, completedLesson.lessonNotes);
    assert.equal(view.delivery.concernFlag, true);
    assert.equal(view.delivery.concernNote, completedLesson.concernNote);
    assert.equal(view.tutorName, "Tutor User");
  });

  test("admin can filter concern-flagged lessons", () => {
    assert.deepEqual(buildAdminLessonDeliveryWhereInput({ concernFlagged: true }), {
      concernFlag: true
    });
  });

  test("parent cannot see admin-only concern details", () => {
    const view = buildParentLessonDetailView(completedLesson);

    assert.equal("concernNote" in view.delivery, false);
    assert.equal(
      view.delivery.parentSafeConcernMessage,
      "Your tutor has flagged that this topic may need extra attention."
    );
  });

  test("tutor delivery queries remain scoped to the assigned tutor", () => {
    assert.deepEqual(buildTutorLessonWhereInput("tutor-user-id", "lesson-id"), {
      id: "lesson-id",
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });
});

describe("admin homework visibility", () => {
  test("admin can see homework across students with operational context", () => {
    const item = buildAdminHomeworkListItem({
      id: "homework-1",
      title: "Fractions practice",
      description: "Complete questions 1 to 10.",
      dueDate: new Date("2026-06-03T00:00:00.000Z"),
      status: "ASSIGNED",
      createdAt: new Date("2026-06-01T11:10:00.000Z"),
      updatedAt: new Date("2026-06-01T11:10:00.000Z"),
      student: {
        id: "student-1",
        fullName: "Amara Okafor",
        parent: {
          user: {
            name: "Parent User"
          }
        }
      },
      tutor: {
        id: "tutor-1",
        user: {
          name: "Tutor User"
        }
      },
      lesson: {
        id: "lesson-1",
        title: "Mathematics foundations",
        subject: {
          name: "Mathematics"
        }
      }
    });

    assert.equal(item.childName, "Amara Okafor");
    assert.equal(item.parentName, "Parent User");
    assert.equal(item.tutorName, "Tutor User");
    assert.equal(item.lessonHref, "/admin/lessons/lesson-1");
  });

  test("admin homework filters support status, tutor, and student", () => {
    assert.deepEqual(
      buildAdminHomeworkWhereInput({
        status: "ASSIGNED",
        tutorId: "tutor-1",
        studentId: "student-1"
      }),
      {
        status: "ASSIGNED",
        tutorId: "tutor-1",
        studentId: "student-1"
      }
    );
  });
});

describe("admin lesson delivery dashboard summary", () => {
  test("summarizes completed lessons, missing notes, concerns, and homework", () => {
    const summary = getAdminLessonDeliveryDashboardSummary(
      [
        completedLesson,
        {
          ...completedLesson,
          id: "lesson-2",
          status: "COMPLETED" as const,
          startTime: new Date("2026-06-02T10:00:00.000Z"),
          lessonNotes: null,
          concernFlag: false,
          homework: []
        }
      ],
      [
        {
          id: "homework-1",
          status: "ASSIGNED" as const,
          createdAt: new Date("2026-06-01T11:10:00.000Z")
        }
      ],
      new Date("2026-06-05T12:00:00.000Z")
    );

    assert.equal(summary.lessonsCompletedThisWeek, 2);
    assert.equal(summary.lessonsNeedingNotes, 1);
    assert.equal(summary.concernFlags, 1);
    assert.equal(summary.homeworkAssigned, 1);
  });
});
