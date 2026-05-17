import assert from "node:assert/strict";
import { describe, test } from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AdminDashboardView,
  ParentDashboardView,
  TutorDashboardView
} from "@/components/dashboard/RoleDashboardViews";

(globalThis as typeof globalThis & { React?: typeof React }).React = React;

const now = new Date("2026-05-17T09:00:00.000Z");

describe("admin dashboard UI", () => {
  test("Admin dashboard renders stat cards and operations sections", () => {
    const html = renderToStaticMarkup(
      createElement(AdminDashboardView, { data: createAdminDashboardData() })
    );

    assert.match(html, /Parents/);
    assert.match(html, /Students/);
    assert.match(html, /Active enrollments/);
    assert.match(html, /Pending assessments/);
    assert.match(html, /Payments awaiting verification/);
    assert.match(html, /Upcoming lessons/);
    assert.match(html, /Reports in review/);
    assert.match(html, /Open support requests/);
    assert.match(html, /Recent Assessment Requests/);
    assert.match(html, /Ada M/);
    assert.match(html, /Payment Summary/);
    assert.match(html, /NGN 90000/);
    assert.match(html, /Fractions lesson/);
    assert.match(html, /Scheduling question/);
    assert.match(html, /May progress report/);
    assert.match(html, /Conversion Funnel/);
    assert.match(html, /Plan recommended/);
  });

  test("Admin dashboard does not render for parent or tutor data", () => {
    const parentHtml = renderToStaticMarkup(
      createElement(AdminDashboardView, {
        data: { ...createAdminDashboardData(), user: { role: "PARENT" } }
      })
    );
    const tutorHtml = renderToStaticMarkup(
      createElement(AdminDashboardView, {
        data: { ...createAdminDashboardData(), user: { role: "TUTOR" } }
      })
    );

    assert.doesNotMatch(parentHtml, /Admin Dashboard/);
    assert.doesNotMatch(tutorHtml, /Admin Dashboard/);
    assert.match(parentHtml, /Dashboard unavailable/);
    assert.match(tutorHtml, /Dashboard unavailable/);
  });

  test("Admin dashboard renders useful empty states and linked operations", () => {
    const html = renderToStaticMarkup(
      createElement(AdminDashboardView, { data: createEmptyAdminDashboardData() })
    );

    assert.match(html, /No assessment requests yet/);
    assert.match(html, /No paid revenue yet/);
    assert.match(html, /No conversion data yet/);
    assert.match(html, /No upcoming lessons/);
    assert.match(html, /No open support requests/);
    assert.match(html, /No payment submissions yet/);
    assert.match(html, /No reports in review/);
    assert.match(html, /No tutor workload yet/);
    assert.match(html, /href="\/admin\/assessments"/);
    assert.match(html, /href="\/admin\/payments"/);
    assert.match(html, /href="\/admin\/lessons"/);
    assert.match(html, /href="\/admin\/reports"/);
    assert.match(html, /href="\/admin\/support"/);
  });
});

describe("parent dashboard UI", () => {
  test("Parent dashboard renders family state, next action, and learning updates", () => {
    const html = renderToStaticMarkup(
      createElement(ParentDashboardView, { data: createParentDashboardData() })
    );

    assert.match(html, /Family Profile/);
    assert.match(html, /Ada M/);
    assert.match(html, /Year 5/);
    assert.match(html, /Choose payment method/);
    assert.match(html, /Pending payment/);
    assert.match(html, /Focused Support/);
    assert.match(html, /Awaiting verification/);
    assert.match(html, /Fractions lesson/);
    assert.match(html, /Fractions practice/);
    assert.match(html, /May progress report/);
    assert.match(html, /Support/);
    assert.match(html, /Scheduling question/);
  });

  test("Parent dashboard does not show another parent's data", () => {
    const html = renderToStaticMarkup(
      createElement(ParentDashboardView, { data: createParentDashboardData() })
    );

    assert.doesNotMatch(html, /Other Parent Child/);
    assert.doesNotMatch(html, /Internal admin note/);
  });

  test("Parent dashboard renders useful empty states", () => {
    const html = renderToStaticMarkup(
      createElement(ParentDashboardView, { data: createEmptyParentDashboardData() })
    );

    assert.match(html, /Complete parent profile/);
    assert.match(html, /No child profile yet/);
    assert.match(html, /No tutoring plan yet/);
    assert.match(html, /No lessons scheduled yet/);
    assert.match(html, /No homework assigned yet/);
    assert.match(html, /No progress reports yet/);
    assert.match(html, /No open support requests/);
  });

  test("Parent dashboard next action follows journey state", () => {
    const noAssessmentHtml = renderToStaticMarkup(
      createElement(ParentDashboardView, {
        data: {
          ...createParentDashboardData(),
          latestAssessment: null,
          enrollments: [],
          activeEnrollment: null,
          nextUpcomingLesson: null,
          paymentStatusSummary: {
            pending: 0,
            awaitingVerification: 0,
            paid: 0,
            failed: 0
          }
        }
      })
    );
    const recommendationHtml = renderToStaticMarkup(
      createElement(ParentDashboardView, {
        data: {
          ...createParentDashboardData(),
          latestAssessment: {
            id: "assessment-ready",
            status: "PLAN_RECOMMENDED",
            student: { id: "student-1", fullName: "Ada M" }
          },
          enrollments: [],
          activeEnrollment: null,
          nextUpcomingLesson: null,
          paymentStatusSummary: {
            pending: 0,
            awaitingVerification: 0,
            paid: 0,
            failed: 0
          }
        }
      })
    );
    const lessonHtml = renderToStaticMarkup(
      createElement(ParentDashboardView, {
        data: {
          ...createParentDashboardData(),
          latestAssessment: {
            id: "assessment-converted",
            status: "CONVERTED",
            student: { id: "student-1", fullName: "Ada M" }
          },
          enrollments: [
            {
              id: "enrollment-active",
              status: "ACTIVE",
              student: { id: "student-1", fullName: "Ada M" },
              tutoringPlan: { id: "plan-1", name: "Focused Support" }
            }
          ],
          activeEnrollment: {
            id: "enrollment-active",
            status: "ACTIVE",
            student: { id: "student-1", fullName: "Ada M" },
            tutoringPlan: { id: "plan-1", name: "Focused Support" }
          },
          paymentStatusSummary: {
            pending: 0,
            awaitingVerification: 0,
            paid: 1,
            failed: 0
          }
        }
      })
    );

    assert.match(noAssessmentHtml, /Book child assessment/);
    assert.match(recommendationHtml, /Accept recommended plan/);
    assert.match(lessonHtml, /View next lesson/);
  });
});

describe("tutor dashboard UI", () => {
  test("Tutor dashboard renders assigned work and teaching tasks", () => {
    const html = renderToStaticMarkup(
      createElement(TutorDashboardView, { data: createTutorDashboardData() })
    );

    assert.match(html, /Today\u2019s Work/);
    assert.match(html, /Today lesson/);
    assert.match(html, /Upcoming lesson/);
    assert.match(html, /Lessons needing notes/);
    assert.match(html, /Assigned Students/);
    assert.match(html, /Ada M/);
    assert.match(html, /Fractions practice/);
    assert.match(html, /Draft reports/);
    assert.match(html, /Reports in review/);
  });

  test("Tutor dashboard does not show payment data or unassigned students", () => {
    const html = renderToStaticMarkup(
      createElement(TutorDashboardView, { data: createTutorDashboardData() })
    );

    assert.doesNotMatch(html, /Payment Summary/);
    assert.doesNotMatch(html, /NGN/);
    assert.doesNotMatch(html, /Unassigned Student/);
  });

  test("Tutor dashboard renders useful empty states", () => {
    const html = renderToStaticMarkup(
      createElement(TutorDashboardView, { data: createEmptyTutorDashboardData() })
    );

    assert.match(html, /No lessons assigned yet/);
    assert.match(html, /No lessons need notes/);
    assert.match(html, /No assigned students yet/);
    assert.match(html, /No homework assigned/);
    assert.match(html, /Draft reports/);
    assert.match(html, /Reports in review/);
  });
});

function createAdminDashboardData() {
  return {
    user: {
      id: "admin-user",
      name: "Admin User",
      email: "admin@topmox.test",
      role: "ADMIN"
    },
    stats: {
      totalParents: 2,
      totalStudents: 4,
      activeEnrollments: 3,
      pendingAssessments: 1,
      paymentsAwaitingVerification: 1,
      paidPayments: 2,
      upcomingLessons: 2,
      completedLessons: 5,
      openSupportRequests: 1,
      reportsInReview: 2,
      activeTutors: 3
    },
    revenue: {
      totalPaidRevenue: 90000,
      paidPaymentCount: 2,
      revenueByCurrency: [
        {
          currency: "NGN",
          amount: "90000",
          paidPayments: 2
        }
      ],
      recentPaidPayments: [
        {
          id: "paid-1",
          amount: "45000",
          currency: "NGN",
          paidAt: now,
          parentName: "Amaka Parent",
          childName: "Ada M",
          planName: "Focused Support"
        }
      ]
    },
    conversionFunnel: {
      assessmentRequests: 8,
      scheduledAssessments: 4,
      completedAssessments: 3,
      planRecommended: 2,
      convertedAssessments: 1,
      activeEnrollments: 3
    },
    recentAssessmentRequests: [
      {
        id: "assessment-1",
        status: "PENDING_REVIEW",
        createdAt: now,
        updatedAt: now,
        student: { id: "student-1", fullName: "Ada M" },
        parent: { user: { name: "Amaka Parent", email: "amaka@test.local" } }
      }
    ],
    recentPayments: [
      {
        id: "payment-1",
        status: "AWAITING_VERIFICATION",
        amount: { toString: () => "45000" },
        currency: "NGN",
        paymentMethod: "MANUAL_TRANSFER",
        createdAt: now,
        parent: { user: { name: "Amaka Parent", email: "amaka@test.local" } },
        student: { id: "student-1", fullName: "Ada M" },
        enrollment: {
          student: { id: "student-1", fullName: "Ada M" },
          tutoringPlan: { id: "plan-1", name: "Focused Support" }
        }
      }
    ],
    upcomingLessons: [
      {
        id: "lesson-1",
        title: "Fractions lesson",
        startTime: now,
        timezone: "Africa/Lagos",
        status: "SCHEDULED",
        student: { id: "student-1", fullName: "Ada M" },
        tutor: { id: "tutor-1", user: { name: "Tutor One" } },
        subject: { id: "subject-1", name: "Mathematics" }
      }
    ],
    openSupportRequests: [
      {
        id: "support-1",
        subject: "Scheduling question",
        status: "OPEN",
        createdAt: now,
        parent: { user: { name: "Amaka Parent", email: "amaka@test.local" } },
        student: { id: "student-1", fullName: "Ada M" }
      }
    ],
    reportsAwaitingReview: [
      {
        id: "report-1",
        status: "REVIEW",
        reportingMonth: now,
        createdAt: now,
        student: { id: "student-1", fullName: "Ada M" },
        tutor: { id: "tutor-1", user: { name: "Tutor One" } },
        title: "May progress report"
      }
    ],
    tutorWorkload: [
      {
        tutorId: "tutor-1",
        tutorName: "Tutor One",
        status: "ACTIVE",
        assignedEnrollments: 2,
        lessons: 6,
        homeworkAssigned: 3,
        reports: 1
      }
    ],
    recentActivity: []
  };
}

function createEmptyAdminDashboardData() {
  return {
    ...createAdminDashboardData(),
    stats: {
      totalParents: 0,
      totalStudents: 0,
      activeEnrollments: 0,
      pendingAssessments: 0,
      paymentsAwaitingVerification: 0,
      paidPayments: 0,
      upcomingLessons: 0,
      completedLessons: 0,
      openSupportRequests: 0,
      reportsInReview: 0,
      activeTutors: 0
    },
    revenue: {
      totalPaidRevenue: 0,
      paidPaymentCount: 0,
      revenueByCurrency: [],
      recentPaidPayments: []
    },
    conversionFunnel: {
      assessmentRequests: 0,
      scheduledAssessments: 0,
      completedAssessments: 0,
      planRecommended: 0,
      convertedAssessments: 0,
      activeEnrollments: 0
    },
    recentAssessmentRequests: [],
    recentPayments: [],
    upcomingLessons: [],
    openSupportRequests: [],
    reportsAwaitingReview: [],
    tutorWorkload: [],
    recentActivity: []
  };
}

function createParentDashboardData() {
  return {
    user: {
      id: "parent-user",
      name: "Amaka Parent",
      email: "amaka@test.local",
      role: "PARENT"
    },
    parentProfileStatus: {
      hasParentProfile: true,
      hasChildren: true,
      childrenCount: 1,
      isComplete: true
    },
    parentProfile: {
      id: "parent-profile-1",
      country: "Nigeria",
      timezone: "Africa/Lagos",
      preferredContactMethod: "WhatsApp"
    },
    childProfiles: [
      {
        id: "student-1",
        fullName: "Ada M",
        age: 10,
        classYearGroup: "Year 5",
        countryOfStudy: "Nigeria",
        curriculum: "British",
        mainAcademicChallenge: "Fractions",
        academicGoal: "Build confidence",
        subjects: [{ id: "subject-1", name: "Mathematics", slug: "math" }]
      }
    ],
    latestAssessment: {
      id: "assessment-1",
      status: "CONVERTED",
      student: { id: "student-1", fullName: "Ada M" }
    },
    recommendedPlan: {
      id: "plan-1",
      name: "Focused Support",
      currency: "NGN",
      monthlyPrice: { toString: () => "45000" },
      sessionsPerWeek: 2
    },
    enrollments: [
      {
        id: "enrollment-1",
        status: "PENDING_PAYMENT",
        student: { id: "student-1", fullName: "Ada M" },
        tutoringPlan: { id: "plan-1", name: "Focused Support" },
        payments: []
      }
    ],
    activeEnrollment: null,
    paymentStatusSummary: {
      pending: 0,
      awaitingVerification: 1,
      paid: 0,
      failed: 0
    },
    nextUpcomingLesson: {
      id: "lesson-1",
      title: "Fractions lesson",
      startTime: now,
      endTime: now,
      timezone: "Africa/Lagos",
      status: "SCHEDULED",
      student: { id: "student-1", fullName: "Ada M" },
      tutor: { user: { name: "Tutor One" } },
      subject: { id: "subject-1", name: "Mathematics", slug: "math" }
    },
    recentCompletedLessonNote: null,
    homeworkDue: [
      {
        id: "homework-1",
        title: "Fractions practice",
        dueDate: now,
        status: "ASSIGNED",
        student: { id: "student-1", fullName: "Ada M" }
      }
    ],
    latestPublishedReport: {
      id: "report-1",
      reportingMonth: now,
      overallProgressStatus: "Improving steadily",
      publishedAt: now,
      student: { id: "student-1", fullName: "Ada M" },
      title: "May progress report"
    },
    openSupportRequests: [
      {
        id: "support-1",
        subject: "Scheduling question",
        status: "OPEN",
        updatedAt: now
      }
    ],
    notificationsSummary: {
      unreadCount: 1,
      recent: []
    },
    recentActivity: []
  };
}

function createEmptyParentDashboardData() {
  return {
    ...createParentDashboardData(),
    parentProfileStatus: {
      hasParentProfile: false,
      hasChildren: false,
      childrenCount: 0,
      isComplete: false
    },
    parentProfile: null,
    childProfiles: [],
    latestAssessment: null,
    recommendedPlan: null,
    enrollments: [],
    activeEnrollment: null,
    paymentStatusSummary: {
      pending: 0,
      awaitingVerification: 0,
      paid: 0,
      failed: 0
    },
    nextUpcomingLesson: null,
    recentCompletedLessonNote: null,
    homeworkDue: [],
    latestPublishedReport: null,
    openSupportRequests: [],
    notificationsSummary: {
      unreadCount: 0,
      recent: []
    },
    recentActivity: []
  };
}

function createTutorDashboardData() {
  return {
    user: {
      id: "tutor-user",
      name: "Tutor One",
      email: "tutor@test.local",
      role: "TUTOR"
    },
    tutorProfile: {
      id: "tutor-profile-1",
      userId: "tutor-user",
      status: "ACTIVE",
      user: { id: "tutor-user", name: "Tutor One", email: "tutor@test.local" },
      subjects: [{ id: "subject-1", name: "Mathematics", slug: "math" }]
    },
    todayLessons: [
      {
        id: "lesson-today",
        title: "Today lesson",
        startTime: now,
        endTime: now,
        timezone: "Africa/Lagos",
        status: "SCHEDULED",
        student: { id: "student-1", fullName: "Ada M" },
        subject: { id: "subject-1", name: "Mathematics", slug: "math" }
      }
    ],
    upcomingLessons: [
      {
        id: "lesson-upcoming",
        title: "Upcoming lesson",
        startTime: new Date("2026-05-18T09:00:00.000Z"),
        endTime: new Date("2026-05-18T10:00:00.000Z"),
        timezone: "Africa/Lagos",
        status: "SCHEDULED",
        student: { id: "student-1", fullName: "Ada M" },
        subject: { id: "subject-1", name: "Mathematics", slug: "math" }
      }
    ],
    lessonsNeedingNotes: [
      {
        id: "lesson-notes",
        title: "Needs notes lesson",
        startTime: now,
        endTime: now,
        timezone: "Africa/Lagos",
        status: "SCHEDULED",
        student: { id: "student-1", fullName: "Ada M" },
        subject: { id: "subject-1", name: "Mathematics", slug: "math" }
      }
    ],
    assignedStudents: [
      {
        enrollmentId: "enrollment-1",
        id: "student-1",
        fullName: "Ada M",
        classYearGroup: "Year 5",
        curriculum: "British",
        planName: "Focused Support"
      }
    ],
    homeworkAssigned: [
      {
        id: "homework-1",
        title: "Fractions practice",
        dueDate: now,
        status: "ASSIGNED",
        student: { id: "student-1", fullName: "Ada M" }
      }
    ],
    reports: {
      draft: [
        {
          id: "report-draft",
          status: "DRAFT",
          reportingMonth: now,
          student: { id: "student-1", fullName: "Ada M" }
        }
      ],
      inReview: [
        {
          id: "report-review",
          status: "REVIEW",
          reportingMonth: now,
          student: { id: "student-1", fullName: "Ada M" }
        }
      ],
      published: [],
      due: []
    },
    notificationsSummary: {
      unreadCount: 0,
      recent: []
    },
    recentActivity: []
  };
}

function createEmptyTutorDashboardData() {
  return {
    ...createTutorDashboardData(),
    tutorProfile: {
      id: "tutor-profile-1",
      userId: "tutor-user",
      status: "ACTIVE",
      user: { id: "tutor-user", name: "Tutor One", email: "tutor@test.local" },
      subjects: []
    },
    todayLessons: [],
    upcomingLessons: [],
    lessonsNeedingNotes: [],
    assignedStudents: [],
    homeworkAssigned: [],
    reports: {
      draft: [],
      inReview: [],
      published: [],
      due: []
    },
    notificationsSummary: {
      unreadCount: 0,
      recent: []
    },
    recentActivity: []
  };
}
