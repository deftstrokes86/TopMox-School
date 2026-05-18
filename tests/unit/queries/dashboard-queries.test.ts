import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { AuthError } from "@/lib/auth";
import {
  getAdminDashboardDataForUser,
  getAdminRevenueSummary,
  getCurrentParentDashboardDataForUser,
  getCurrentTutorDashboardDataForUser
} from "@/server/queries/dashboard.queries";

const now = new Date("2026-05-17T09:00:00.000Z");

const adminUser = {
  id: "admin-user",
  email: "admin@topmox.test",
  name: "Admin User",
  role: "ADMIN" as const
};

const parentUser = {
  id: "parent-user",
  email: "parent@topmox.test",
  name: "Parent User",
  role: "PARENT" as const
};

const tutorUser = {
  id: "tutor-user",
  email: "tutor@topmox.test",
  name: "Tutor User",
  role: "TUTOR" as const
};

describe("admin dashboard aggregation", () => {
  test("admin can fetch dashboard data with key counts and safe empty lists", async () => {
    const calls: unknown[] = [];
    const client = createAdminDashboardClient(calls);

    const data = await getAdminDashboardDataForUser(adminUser, client, now);

    assert.equal(data.stats.totalParents, 7);
    assert.equal(data.stats.totalStudents, 12);
    assert.equal(data.stats.activeEnrollments, 5);
    assert.equal(data.stats.pendingAssessments, 3);
    assert.equal(data.stats.paymentsAwaitingVerification, 2);
    assert.equal(data.stats.upcomingLessons, 4);
    assert.equal(data.stats.openSupportRequests, 6);
    assert.equal(data.stats.reportsInReview, 1);
    assert.deepEqual(data.conversionFunnel, {
      assessmentRequests: 11,
      scheduledAssessments: 4,
      completedAssessments: 3,
      planRecommended: 2,
      convertedAssessments: 1,
      activeEnrollments: 5
    });
    assert.deepEqual(data.tutorWorkload, []);
    assert.equal(
      calls.some(
        (call) =>
          JSON.stringify(call) ===
          JSON.stringify({
            model: "user.count",
            args: { where: { role: "PARENT" } }
          })
      ),
      true
    );
  });

  test("non-admin cannot fetch admin dashboard data", async () => {
    const client = createAdminDashboardClient([]);

    await assert.rejects(
      () => getAdminDashboardDataForUser(parentUser, client, now),
      (error) => error instanceof AuthError && error.code === "FORBIDDEN"
    );
  });

  test("admin revenue summary counts paid payments only", async () => {
    const calls: unknown[] = [];
    const client = {
      payment: {
        groupBy: async (args: unknown) => {
          calls.push({ model: "payment.groupBy", args });
          return [
            {
              currency: "NGN",
              _sum: { amount: { toString: () => "45000" } },
              _count: { _all: 2 }
            }
          ];
        },
        findMany: async (args: unknown) => {
          calls.push({ model: "payment.findMany", args });
          return [];
        }
      }
    };

    const summary = await getAdminRevenueSummary(client);

    assert.equal(summary.paidPaymentCount, 2);
    assert.equal(summary.revenueByCurrency[0]?.amount, "45000");
    assert.deepEqual(calls[0], {
      model: "payment.groupBy",
      args: {
        by: ["currency"],
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { _all: true }
      }
    });
  });

  test("admin dashboard returns a safe empty state when Supabase reads fail", async () => {
    const client = {
      user: {
        count: async () => {
          throw new Error("P1001 simulated Supabase pooler failure");
        }
      }
    };

    const data = await getAdminDashboardDataForUser(adminUser, client, now);

    assert.equal(data.stats.totalParents, 0);
    assert.deepEqual(data.recentAssessmentRequests, []);
    assert.deepEqual(data.recentActivity, []);
  });
});

describe("parent dashboard aggregation", () => {
  test("parent dashboard is scoped to the current parent and hides internal data", async () => {
    const calls: unknown[] = [];
    const client = createParentDashboardClient(calls);

    const data = await getCurrentParentDashboardDataForUser(
      parentUser,
      client,
      now
    );

    assert.equal(data.parentProfileStatus.hasParentProfile, true);
    assert.equal(data.childProfiles.length, 1);
    assert.equal(data.latestAssessment?.id, "assessment-1");
    assert.equal(data.latestAssessment?.outcome?.internalAdminNotes, undefined);
    assert.equal(data.latestPublishedReport?.id, "report-1");
    assert.equal(data.openSupportRequests.length, 1);
    assert.equal(data.paymentStatusSummary.awaitingVerification, 1);
    assert.equal(data.nextUpcomingLesson?.id, "lesson-upcoming");
    assert.equal(data.recentCompletedLessonNote?.lessonNotes, "Great focus.");
    assert.equal(data.homeworkDue[0]?.id, "homework-1");
    assert.equal(data.notificationsSummary.unreadCount, 2);
    assert.equal(
      calls.some(
        (call) =>
          JSON.stringify(call) ===
          JSON.stringify({
            model: "assessmentRequest.findMany",
            args: {
              where: { parentId: "parent-profile-1" },
              select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                scheduledAt: true,
                student: { select: { id: true, fullName: true } },
                outcome: {
                  select: {
                    id: true,
                    recommendedPlanId: true,
                    parentFacingSummary: true,
                    recommendedPlan: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        monthlyPrice: true,
                        currency: true,
                        sessionsPerWeek: true,
                        bestFor: true
                      }
                    }
                  }
                }
              },
              orderBy: { createdAt: "desc" },
              take: 5
            }
          })
      ),
      true
    );
  });

  test("missing parent profile returns a safe empty state", async () => {
    const client = {
      parentProfile: {
        findUnique: async () => null
      }
    };

    const data = await getCurrentParentDashboardDataForUser(
      parentUser,
      client,
      now
    );

    assert.deepEqual(data.childProfiles, []);
    assert.equal(data.parentProfileStatus.hasParentProfile, false);
    assert.equal(data.latestAssessment, null);
  });

  test("parent dashboard returns a safe empty state when Supabase reads fail", async () => {
    const client = {
      parentProfile: {
        findUnique: async () => {
          throw new Error("P1001 simulated Supabase pooler failure");
        }
      }
    };

    const data = await getCurrentParentDashboardDataForUser(
      parentUser,
      client,
      now
    );

    assert.equal(data.parentProfileStatus.hasParentProfile, false);
    assert.deepEqual(data.childProfiles, []);
    assert.deepEqual(data.recentActivity, []);
  });

  test("non-parent cannot fetch parent dashboard data", async () => {
    await assert.rejects(
      () => getCurrentParentDashboardDataForUser(tutorUser, {}, now),
      (error) => error instanceof AuthError && error.code === "FORBIDDEN"
    );
  });
});

describe("tutor dashboard aggregation", () => {
  test("tutor dashboard is scoped to assigned work and excludes payment data", async () => {
    const calls: unknown[] = [];
    const client = createTutorDashboardClient(calls);

    const data = await getCurrentTutorDashboardDataForUser(
      tutorUser,
      client,
      now
    );

    assert.equal(data.tutorProfile?.id, "tutor-profile-1");
    assert.equal(data.todayLessons.length, 1);
    assert.equal(data.upcomingLessons.length, 1);
    assert.equal(data.lessonsNeedingNotes.length, 1);
    assert.equal(data.assignedStudents[0]?.id, "student-1");
    assert.equal(data.homeworkAssigned.length, 1);
    assert.equal(data.reports.draft.length, 1);
    assert.equal("payments" in data, false);
    assert.equal(
      calls.some(
        (call) =>
          JSON.stringify(call) ===
          JSON.stringify({
            model: "lesson.findMany",
            args: {
              where: { tutorId: "tutor-profile-1" },
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                timezone: true,
                status: true,
                meetingLink: true,
                lessonNotes: true,
                student: {
                  select: {
                    id: true,
                    fullName: true,
                    classYearGroup: true
                  }
                },
                subject: { select: { id: true, name: true, slug: true } }
              },
              orderBy: { startTime: "asc" },
              take: 20
            }
          })
      ),
      true
    );
  });

  test("missing tutor profile returns a safe empty state", async () => {
    const client = {
      tutorProfile: {
        findUnique: async () => null
      }
    };

    const data = await getCurrentTutorDashboardDataForUser(
      tutorUser,
      client,
      now
    );

    assert.equal(data.tutorProfile, null);
    assert.deepEqual(data.todayLessons, []);
    assert.deepEqual(data.assignedStudents, []);
  });

  test("tutor dashboard returns a safe empty state when Supabase reads fail", async () => {
    const client = {
      tutorProfile: {
        findUnique: async () => {
          throw new Error("P1001 simulated Supabase pooler failure");
        }
      }
    };

    const data = await getCurrentTutorDashboardDataForUser(
      tutorUser,
      client,
      now
    );

    assert.equal(data.tutorProfile, null);
    assert.deepEqual(data.todayLessons, []);
    assert.deepEqual(data.recentActivity, []);
  });

  test("non-tutor cannot fetch tutor dashboard data", async () => {
    await assert.rejects(
      () => getCurrentTutorDashboardDataForUser(parentUser, {}, now),
      (error) => error instanceof AuthError && error.code === "FORBIDDEN"
    );
  });
});

function createAdminDashboardClient(calls: unknown[]) {
  const countValues = {
    "user.count": 7,
    "studentProfile.count": 12,
    "enrollment.count": 5,
    "assessmentRequest.count": 3,
    "payment.count": 2,
    "lesson.count": 4,
    "supportRequest.count": 6,
    "progressReport.count": 1,
    "tutorProfile.count": 8
  };

  return {
    user: {
      count: async (args: unknown) => {
        calls.push({ model: "user.count", args });
        return countValues["user.count"];
      }
    },
    studentProfile: {
      count: async (args: unknown) => {
        calls.push({ model: "studentProfile.count", args });
        return countValues["studentProfile.count"];
      }
    },
    enrollment: {
      count: async (args: unknown) => {
        calls.push({ model: "enrollment.count", args });
        return countValues["enrollment.count"];
      }
    },
    assessmentRequest: {
      count: async (args: unknown) => {
        calls.push({ model: "assessmentRequest.count", args });
        const key = JSON.stringify(args);
        if (key === "{}") return 11;
        if (key.includes("SCHEDULED")) return 4;
        if (key.includes("COMPLETED")) return 3;
        if (key.includes("PLAN_RECOMMENDED")) return 2;
        if (key.includes("CONVERTED")) return 1;
        return countValues["assessmentRequest.count"];
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "assessmentRequest.findMany", args });
        return [];
      }
    },
    payment: {
      count: async (args: unknown) => {
        calls.push({ model: "payment.count", args });
        return JSON.stringify(args).includes("PAID") ? 9 : 2;
      },
      groupBy: async (args: unknown) => {
        calls.push({ model: "payment.groupBy", args });
        return [];
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "payment.findMany", args });
        return [];
      }
    },
    lesson: {
      count: async (args: unknown) => {
        calls.push({ model: "lesson.count", args });
        return JSON.stringify(args).includes("COMPLETED") ? 10 : 4;
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "lesson.findMany", args });
        return [];
      }
    },
    supportRequest: {
      count: async (args: unknown) => {
        calls.push({ model: "supportRequest.count", args });
        return countValues["supportRequest.count"];
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "supportRequest.findMany", args });
        return [];
      }
    },
    progressReport: {
      count: async (args: unknown) => {
        calls.push({ model: "progressReport.count", args });
        return countValues["progressReport.count"];
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "progressReport.findMany", args });
        return [];
      }
    },
    tutorProfile: {
      count: async (args: unknown) => {
        calls.push({ model: "tutorProfile.count", args });
        return countValues["tutorProfile.count"];
      },
      findMany: async (args: unknown) => {
        calls.push({ model: "tutorProfile.findMany", args });
        return [];
      }
    },
    communicationLog: {
      findMany: async (args: unknown) => {
        calls.push({ model: "communicationLog.findMany", args });
        return [];
      }
    },
    notification: {
      findMany: async (args: unknown) => {
        calls.push({ model: "notification.findMany", args });
        return [];
      },
      count: async (args: unknown) => {
        calls.push({ model: "notification.count", args });
        return 0;
      }
    }
  };
}

function createParentDashboardClient(calls: unknown[]) {
  return {
    parentProfile: {
      findUnique: async (args: unknown) => {
        calls.push({ model: "parentProfile.findUnique", args });
        return {
          id: "parent-profile-1",
          userId: parentUser.id,
          country: "Nigeria",
          timezone: "Africa/Lagos",
          students: [
            {
              id: "student-1",
              fullName: "Ada",
              age: 10,
              classYearGroup: "Year 5",
              countryOfStudy: "Nigeria",
              curriculum: "British",
              mainAcademicChallenge: "Fractions",
              academicGoal: "Confidence",
              subjects: [{ id: "subject-1", name: "Mathematics", slug: "math" }]
            }
          ]
        };
      }
    },
    assessmentRequest: {
      findMany: async (args: unknown) => {
        calls.push({ model: "assessmentRequest.findMany", args });
        return [
          {
            id: "assessment-1",
            status: "PLAN_RECOMMENDED",
            createdAt: new Date("2026-05-16T09:00:00.000Z"),
            updatedAt: new Date("2026-05-16T09:00:00.000Z"),
            scheduledAt: null,
            student: { id: "student-1", fullName: "Ada" },
            outcome: {
              id: "outcome-1",
              recommendedPlanId: "plan-1",
              parentFacingSummary: "Ada needs structured mathematics support.",
              recommendedPlan: {
                id: "plan-1",
                name: "Focused Support",
                slug: "focused-support",
                monthlyPrice: { toString: () => "45000" },
                currency: "NGN",
                sessionsPerWeek: 2,
                bestFor: "Focused academic support"
              }
            }
          }
        ];
      }
    },
    enrollment: {
      findMany: async () => [
        {
          id: "enrollment-1",
          status: "PENDING_PAYMENT",
          student: { id: "student-1", fullName: "Ada" },
          tutoringPlan: {
            id: "plan-1",
            name: "Focused Support",
            monthlyPrice: { toString: () => "45000" },
            currency: "NGN",
            sessionsPerWeek: 2
          },
          payments: []
        }
      ]
    },
    payment: {
      findMany: async () => [
        {
          id: "payment-1",
          status: "AWAITING_VERIFICATION",
          amount: { toString: () => "45000" },
          currency: "NGN",
          paymentMethod: "MANUAL_TRANSFER",
          checkoutUrl: null,
          createdAt: now,
          student: { id: "student-1", fullName: "Ada" },
          enrollment: null
        }
      ]
    },
    lesson: {
      findMany: async () => [
        {
          id: "lesson-upcoming",
          title: "Fractions lesson",
          startTime: new Date("2026-05-17T12:00:00.000Z"),
          endTime: new Date("2026-05-17T13:00:00.000Z"),
          timezone: "Africa/Lagos",
          status: "SCHEDULED",
          meetingLink: "https://meet.example.com/lesson",
          lessonNotes: null,
          student: { id: "student-1", fullName: "Ada" },
          tutor: { user: { name: "Tutor One" } },
          subject: { id: "subject-1", name: "Mathematics", slug: "math" }
        },
        {
          id: "lesson-completed",
          title: "Numbers lesson",
          startTime: new Date("2026-05-10T12:00:00.000Z"),
          endTime: new Date("2026-05-10T13:00:00.000Z"),
          timezone: "Africa/Lagos",
          status: "COMPLETED",
          meetingLink: null,
          lessonNotes: "Great focus.",
          student: { id: "student-1", fullName: "Ada" },
          tutor: { user: { name: "Tutor One" } },
          subject: { id: "subject-1", name: "Mathematics", slug: "math" }
        }
      ]
    },
    homework: {
      findMany: async () => [
        {
          id: "homework-1",
          title: "Fractions practice",
          dueDate: new Date("2026-05-20T09:00:00.000Z"),
          status: "ASSIGNED",
          student: { id: "student-1", fullName: "Ada" },
          lesson: { id: "lesson-upcoming", title: "Fractions lesson" }
        }
      ]
    },
    progressReport: {
      findMany: async () => [
        {
          id: "report-1",
          reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
          overallProgressStatus: "IMPROVING",
          publishedAt: new Date("2026-05-15T00:00:00.000Z"),
          student: { id: "student-1", fullName: "Ada" },
          tutor: { user: { name: "Tutor One" } }
        }
      ]
    },
    supportRequest: {
      findMany: async () => [
        {
          id: "support-1",
          subject: "Scheduling question",
          status: "OPEN",
          createdAt: now,
          updatedAt: now
        }
      ]
    },
    notification: {
      findMany: async () => [],
      count: async () => 2
    }
  };
}

function createTutorDashboardClient(calls: unknown[]) {
  return {
    tutorProfile: {
      findUnique: async (args: unknown) => {
        calls.push({ model: "tutorProfile.findUnique", args });
        return {
          id: "tutor-profile-1",
          userId: tutorUser.id,
          status: "ACTIVE",
          user: { id: tutorUser.id, name: tutorUser.name, email: tutorUser.email }
        };
      }
    },
    lesson: {
      findMany: async (args: unknown) => {
        calls.push({ model: "lesson.findMany", args });
        return [
          {
            id: "lesson-today",
            title: "Today lesson",
            startTime: new Date("2026-05-17T10:00:00.000Z"),
            endTime: new Date("2026-05-17T11:00:00.000Z"),
            timezone: "Africa/Lagos",
            status: "SCHEDULED",
            meetingLink: null,
            lessonNotes: null,
            student: {
              id: "student-1",
              fullName: "Ada",
              classYearGroup: "Year 5"
            },
            subject: { id: "subject-1", name: "Mathematics", slug: "math" }
          },
          {
            id: "lesson-needing-notes",
            title: "Needs notes lesson",
            startTime: new Date("2026-05-17T08:00:00.000Z"),
            endTime: new Date("2026-05-17T09:00:00.000Z"),
            timezone: "Africa/Lagos",
            status: "SCHEDULED",
            meetingLink: null,
            lessonNotes: null,
            student: {
              id: "student-1",
              fullName: "Ada",
              classYearGroup: "Year 5"
            },
            subject: { id: "subject-1", name: "Mathematics", slug: "math" }
          },
          {
            id: "lesson-upcoming",
            title: "Upcoming lesson",
            startTime: new Date("2026-05-18T10:00:00.000Z"),
            endTime: new Date("2026-05-18T11:00:00.000Z"),
            timezone: "Africa/Lagos",
            status: "SCHEDULED",
            meetingLink: null,
            lessonNotes: "Prepared notes",
            student: {
              id: "student-1",
              fullName: "Ada",
              classYearGroup: "Year 5"
            },
            subject: { id: "subject-1", name: "Mathematics", slug: "math" }
          }
        ];
      }
    },
    homework: {
      findMany: async () => [
        {
          id: "homework-1",
          title: "Fractions practice",
          dueDate: new Date("2026-05-20T00:00:00.000Z"),
          status: "ASSIGNED",
          student: {
            id: "student-1",
            fullName: "Ada",
            classYearGroup: "Year 5"
          },
          lesson: { id: "lesson-today", title: "Today lesson" }
        }
      ]
    },
    progressReport: {
      findMany: async () => [
        {
          id: "report-draft",
          status: "DRAFT",
          reportingMonth: new Date("2026-05-01T00:00:00.000Z"),
          student: { id: "student-1", fullName: "Ada" }
        }
      ]
    },
    enrollment: {
      findMany: async () => [
        {
          id: "enrollment-1",
          student: {
            id: "student-1",
            fullName: "Ada",
            classYearGroup: "Year 5",
            curriculum: "British"
          },
          tutoringPlan: { id: "plan-1", name: "Focused Support" }
        }
      ]
    },
    notification: {
      findMany: async () => [],
      count: async () => 0
    }
  };
}
