import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminActivityFeedFromRecords,
  buildParentActivityFeedFromRecords,
  buildTutorActivityFeedFromRecords
} from "@/lib/utils/activity-feed";

const now = new Date("2026-05-16T12:00:00.000Z");
const earlier = new Date("2026-05-15T12:00:00.000Z");

const completeRecords = {
  assessments: [
    {
      id: "assessment-1",
      parentId: "parent-1",
      childName: "Ada",
      status: "SCHEDULED",
      timestamp: now
    }
  ],
  payments: [
    {
      id: "payment-1",
      parentId: "parent-1",
      childName: "Ada",
      status: "PAID",
      amount: "25000",
      currency: "NGN",
      timestamp: earlier
    }
  ],
  lessons: [
    {
      id: "lesson-1",
      parentId: "parent-1",
      tutorId: "tutor-1",
      childName: "Ada",
      subjectName: "Mathematics",
      status: "COMPLETED",
      timestamp: new Date("2026-05-14T12:00:00.000Z")
    }
  ],
  homework: [
    {
      id: "homework-1",
      parentId: "parent-1",
      tutorId: "tutor-1",
      childName: "Ada",
      title: "Fractions practice",
      status: "ASSIGNED",
      timestamp: new Date("2026-05-13T12:00:00.000Z")
    }
  ],
  reports: [
    {
      id: "report-1",
      parentId: "parent-1",
      tutorId: "tutor-1",
      childName: "Ada",
      status: "PUBLISHED",
      timestamp: new Date("2026-05-12T12:00:00.000Z")
    }
  ],
  supportRequests: [
    {
      id: "support-1",
      parentId: "parent-1",
      subject: "Schedule question",
      status: "OPEN",
      timestamp: new Date("2026-05-11T12:00:00.000Z")
    }
  ],
  communicationLogs: [
    {
      id: "communication-1",
      parentId: "parent-1",
      studentId: "student-1",
      type: "WHATSAPP",
      message: "Confirmed assessment timing with parent.",
      timestamp: new Date("2026-05-10T12:00:00.000Z")
    }
  ]
};

describe("admin activity feed model", () => {
  test("Admin activity feed includes recent assessments, payments, lessons, reports, support requests, and communication logs", () => {
    const feed = buildAdminActivityFeedFromRecords(completeRecords, 10);

    assert.deepEqual(
      feed.map((item) => item.category),
      [
        "assessment",
        "payment",
        "lesson",
        "homework",
        "report",
        "support",
        "communication"
      ]
    );
    assert.equal(feed[0].href, "/admin/assessments/assessment-1");
  });

  test("Admin feed does not crash when some modules have no records", () => {
    const feed = buildAdminActivityFeedFromRecords(
      {
        assessments: [],
        payments: [],
        lessons: [],
        homework: [],
        reports: [],
        supportRequests: [],
        communicationLogs: []
      },
      10
    );

    assert.deepEqual(feed, []);
  });
});

describe("parent activity feed model", () => {
  test("Parent activity feed includes only own assessment, payment, lesson, homework, report, and support updates", () => {
    const feed = buildParentActivityFeedFromRecords(
      {
        ...completeRecords,
        assessments: [
          ...completeRecords.assessments,
          {
            id: "other-assessment",
            parentId: "other-parent",
            childName: "Other Child",
            status: "PENDING_REVIEW",
            timestamp: new Date("2026-05-16T13:00:00.000Z")
          }
        ],
        payments: [
          ...completeRecords.payments,
          {
            id: "other-payment",
            parentId: "other-parent",
            childName: "Other Child",
            status: "PAID",
            amount: "100",
            currency: "USD",
            timestamp: new Date("2026-05-16T14:00:00.000Z")
          }
        ],
        lessons: [
          ...completeRecords.lessons,
          {
            id: "other-lesson",
            parentId: "other-parent",
            tutorId: "tutor-1",
            childName: "Other Child",
            subjectName: "English",
            status: "SCHEDULED",
            timestamp: new Date("2026-05-16T15:00:00.000Z")
          }
        ]
      },
      "parent-1",
      10
    );

    assert.equal(feed.some((item) => item.title.includes("Other Child")), false);
    assert.deepEqual(
      feed.map((item) => item.category),
      ["assessment", "payment", "lesson", "homework", "report", "support"]
    );
    assert.equal(feed[0].href, "/parent/assessments/assessment-1");
  });

  test("Parent activity feed strips unsafe notification links", () => {
    const feed = buildParentActivityFeedFromRecords(
      {
        notifications: [
          {
            id: "unsafe-notification",
            title: "Admin-only payment queue",
            message: "This should not link a parent into admin.",
            href: "/admin/payments",
            timestamp: now
          }
        ]
      },
      "parent-1",
      10
    );

    assert.equal(feed[0].category, "notification");
    assert.equal(feed[0].href, undefined);
  });
});

describe("tutor activity feed model", () => {
  test("Tutor activity feed includes assigned lessons, lesson completions, homework assigned, and reports", () => {
    const feed = buildTutorActivityFeedFromRecords(
      {
        lessons: [
          ...completeRecords.lessons,
          {
            id: "unassigned-lesson",
            parentId: "parent-1",
            tutorId: "other-tutor",
            childName: "Ada",
            subjectName: "English",
            status: "SCHEDULED",
            timestamp: new Date("2026-05-16T15:00:00.000Z")
          }
        ],
        homework: [
          ...completeRecords.homework,
          {
            id: "unassigned-homework",
            parentId: "parent-1",
            tutorId: "other-tutor",
            childName: "Ada",
            title: "Reading task",
            status: "ASSIGNED",
            timestamp: new Date("2026-05-16T16:00:00.000Z")
          }
        ],
        reports: [
          ...completeRecords.reports,
          {
            id: "unassigned-report",
            parentId: "parent-1",
            tutorId: "other-tutor",
            childName: "Ada",
            status: "DRAFT",
            timestamp: new Date("2026-05-16T17:00:00.000Z")
          }
        ]
      },
      "tutor-1",
      10
    );

    assert.equal(feed.some((item) => item.id.includes("unassigned")), false);
    assert.deepEqual(
      feed.map((item) => item.category),
      ["lesson", "homework", "report"]
    );
    assert.equal(feed[0].href, "/tutor/lessons/lesson-1");
  });

  test("Tutor activity feed strips unsafe notification links", () => {
    const feed = buildTutorActivityFeedFromRecords(
      {
        notifications: [
          {
            id: "unsafe-notification",
            title: "Parent payment update",
            message: "This should not link a tutor into a parent area.",
            href: "/parent/payments/payment-id",
            timestamp: now
          }
        ]
      },
      "tutor-1",
      10
    );

    assert.equal(feed[0].category, "notification");
    assert.equal(feed[0].href, undefined);
  });
});
