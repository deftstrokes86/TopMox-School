import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildParentLessonDetailView,
  buildParentLessonWhereInput,
  buildTutorLessonDetailView,
  buildTutorLessonWhereInput
} from "@/server/queries/lesson.queries";
import {
  getNextUpcomingLessonSummary,
  getTutorLessonDashboardSummary
} from "@/lib/utils/lesson-dashboard";

const baseLesson = {
  id: "lesson-1",
  title: "Mathematics foundations",
  startTime: new Date("2026-06-01T10:00:00.000Z"),
  endTime: new Date("2026-06-01T11:00:00.000Z"),
  timezone: "Africa/Lagos",
  meetingLink: "https://meet.example.com/topmox",
  status: "COMPLETED" as const,
  lessonNotes: "Amara completed fraction examples with guided practice.",
  concernFlag: true,
  concernNote: "Internal concern note",
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
      name: "Tutor User",
      email: "tutor@example.com"
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

describe("parent lesson visibility", () => {
  test("parent lesson queries are scoped to the current parent's lessons", () => {
    assert.deepEqual(buildParentLessonWhereInput("parent-user-id"), {
      parent: {
        userId: "parent-user-id"
      }
    });
  });

  test("parent lesson detail query does not leak another parent's lesson", () => {
    assert.deepEqual(
      buildParentLessonWhereInput("parent-user-id", "lesson-id"),
      {
        id: "lesson-id",
        parent: {
          userId: "parent-user-id"
        }
      }
    );
  });

  test("parent sees completed lesson notes for own child", () => {
    const view = buildParentLessonDetailView(baseLesson);

    assert.equal(view.childName, "Amara Okafor");
    assert.equal(view.tutorName, "Tutor User");
    assert.equal(
      view.delivery.lessonNotes,
      "Amara completed fraction examples with guided practice."
    );
    assert.equal(view.delivery.attended, true);
  });

  test("parent lesson detail view hides internal/admin-only fields", () => {
    const view = buildParentLessonDetailView(baseLesson);

    assert.equal("concernNote" in view, false);
    assert.equal(view.delivery.parentSafeConcernMessage, "Your tutor has flagged that this topic may need extra attention.");
  });

  test("parent sees homework assigned from their own lesson", () => {
    const view = buildParentLessonDetailView(baseLesson);

    assert.equal(view.homework.length, 1);
    assert.equal(view.homework[0]?.title, "Fractions practice");
    assert.equal(view.homework[0]?.description, "Complete questions 1 to 10 before the next lesson.");
  });
});

describe("tutor lesson visibility", () => {
  test("tutor lesson queries are scoped to assigned lessons", () => {
    assert.deepEqual(buildTutorLessonWhereInput("tutor-user-id"), {
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });

  test("tutor lesson detail query does not leak unassigned lessons", () => {
    assert.deepEqual(buildTutorLessonWhereInput("tutor-user-id", "lesson-id"), {
      id: "lesson-id",
      tutor: {
        userId: "tutor-user-id"
      }
    });
  });

  test("tutor lesson detail view includes teaching context", () => {
    const view = buildTutorLessonDetailView(baseLesson);

    assert.equal(view.studentName, "Amara Okafor");
    assert.equal(view.learningContext.classYearGroup, "Primary 5");
    assert.equal(view.learningContext.curriculum, "British-Nigerian blend");
    assert.equal(
      view.learningContext.mainAcademicChallenge,
      "Needs stronger number confidence"
    );
    assert.equal(view.learningContext.academicGoal, "Build confidence before exams");
    assert.equal("parentEmail" in view, false);
  });
});

describe("lesson dashboard state", () => {
  test("parent dashboard shows the next upcoming lesson", () => {
    const next = getNextUpcomingLessonSummary(
      [
        {
          id: "past",
          title: "Past lesson",
          startTime: new Date("2026-05-01T10:00:00.000Z"),
          status: "SCHEDULED",
          student: { fullName: "Amara" },
          subject: { name: "English" }
        },
        {
          id: "next",
          title: "Next lesson",
          startTime: new Date("2026-05-16T10:00:00.000Z"),
          status: "SCHEDULED",
          student: { fullName: "Amara" },
          subject: { name: "Mathematics" }
        },
        {
          id: "later",
          title: "Later lesson",
          startTime: new Date("2026-05-20T10:00:00.000Z"),
          status: "SCHEDULED",
          student: { fullName: "Amara" },
          subject: { name: "Science" }
        }
      ],
      new Date("2026-05-15T09:00:00.000Z")
    );

    assert.equal(next?.id, "next");
    assert.equal(next?.childName, "Amara");
    assert.equal(next?.subjectName, "Mathematics");
  });

  test("tutor dashboard shows today's and upcoming assigned lessons", () => {
    const summary = getTutorLessonDashboardSummary(
      [
        {
          id: "today",
          title: "Today lesson",
          startTime: new Date("2026-05-15T12:00:00.000Z"),
          status: "SCHEDULED",
          student: { fullName: "Amara" },
          subject: { name: "Mathematics" }
        },
        {
          id: "upcoming",
          title: "Upcoming lesson",
          startTime: new Date("2026-05-16T12:00:00.000Z"),
          status: "RESCHEDULED",
          student: { fullName: "David" },
          subject: { name: "English" }
        },
        {
          id: "cancelled",
          title: "Cancelled lesson",
          startTime: new Date("2026-05-15T14:00:00.000Z"),
          status: "CANCELLED",
          student: { fullName: "David" },
          subject: { name: "Science" }
        }
      ],
      new Date("2026-05-15T09:00:00.000Z")
    );

    assert.deepEqual(
      summary.today.map((lesson) => lesson.id),
      ["today"]
    );
    assert.deepEqual(
      summary.upcoming.map((lesson) => lesson.id),
      ["upcoming"]
    );
  });
});
