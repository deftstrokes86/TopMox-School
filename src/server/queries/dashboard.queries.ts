import type { AuthUser } from "@/lib/auth";
import {
  AuthError,
  requireAdmin,
  requireParent,
  requireTutor
} from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildAdminActivityFeedFromRecords,
  buildParentActivityFeedFromRecords,
  buildTutorActivityFeedFromRecords,
  type ActivityFeedItem
} from "@/lib/utils/activity-feed";

type QueryOperation = (args?: unknown) => Promise<unknown>;
type QueryDelegate = Record<string, QueryOperation>;

export type DashboardQueryClient = {
  user?: QueryDelegate;
  parentProfile?: QueryDelegate;
  studentProfile?: QueryDelegate;
  tutorProfile?: QueryDelegate;
  assessmentRequest?: QueryDelegate;
  enrollment?: QueryDelegate;
  payment?: QueryDelegate;
  lesson?: QueryDelegate;
  homework?: QueryDelegate;
  progressReport?: QueryDelegate;
  supportRequest?: QueryDelegate;
  communicationLog?: QueryDelegate;
  notification?: QueryDelegate;
};

type DashboardRole = "ADMIN" | "PARENT" | "TUTOR";

type DashboardLesson = {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  timezone: string;
  status: string;
  meetingLink?: string | null;
  lessonNotes?: string | null;
  student?: {
    id: string;
    fullName: string;
    classYearGroup?: string;
  };
  tutor?: {
    user?: {
      name: string;
    };
  };
  subject?: {
    id: string;
    name: string;
    slug?: string;
  };
};

type RevenueCurrencyRow = {
  currency: string;
  _sum?: {
    amount?: unknown;
  };
  _count?: {
    _all?: number;
  };
};

type RecentPaidPaymentRecord = {
  id: string;
  amount: unknown;
  currency: string;
  paidAt?: Date | null;
  parent?: {
    user?: {
      name?: string;
      email?: string;
    };
  } | null;
  enrollment?: {
    student?: {
      fullName?: string;
    } | null;
    tutoringPlan?: {
      name?: string;
    } | null;
  } | null;
};

type TutorWorkloadRecord = {
  id: string;
  status: string;
  user?: {
    name?: string;
  } | null;
  _count?: {
    assignedEnrollments?: number;
    lessons?: number;
    homework?: number;
    progressReports?: number;
  };
};

type AdminActivityAssessmentRecord = {
  id: string;
  parentId?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  student?: {
    fullName?: string;
  } | null;
};

type AdminActivityPaymentRecord = {
  id: string;
  parentId?: string | null;
  status: string;
  amount?: unknown;
  currency?: string | null;
  createdAt: Date;
  student?: {
    fullName?: string;
  } | null;
  enrollment?: {
    student?: {
      fullName?: string;
    } | null;
  } | null;
};

type AdminActivityLessonRecord = DashboardLesson & {
  parentId?: string | null;
  tutorId?: string | null;
};

type AdminActivitySupportRecord = {
  id: string;
  parentId?: string | null;
  subject: string;
  status: string;
  createdAt: Date;
};

type AdminActivityReportRecord = {
  id: string;
  parentId?: string | null;
  tutorId?: string | null;
  status: string;
  createdAt: Date;
  student?: {
    fullName?: string;
  } | null;
};

type AdminDashboardAssessmentItem = AdminActivityAssessmentRecord & {
  parent?: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

type AdminDashboardPaymentItem = AdminActivityPaymentRecord & {
  paymentMethod?: string | null;
  parent?: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

type AdminDashboardSupportItem = AdminActivitySupportRecord & {
  parent?: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
  student?: {
    id?: string;
    fullName?: string;
  } | null;
};

type AdminDashboardReportItem = AdminActivityReportRecord & {
  title?: string;
  reportingMonth?: Date;
  tutor?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
};

type CommunicationLogActivityRecord = {
  id: string;
  parentId?: string | null;
  studentId?: string | null;
  assessmentRequestId?: string | null;
  lessonId?: string | null;
  paymentId?: string | null;
  supportRequestId?: string | null;
  type: string;
  message: string;
  createdAt: Date;
};

type NotificationActivityRecord = {
  id: string;
  title: string;
  message: string;
  href?: string | null;
  createdAt: Date;
};

type ParentAssessmentRecord = AdminActivityAssessmentRecord & {
  scheduledAt?: Date | null;
  outcome?: {
    id: string;
    recommendedPlanId?: string | null;
    parentFacingSummary?: string | null;
    internalAdminNotes?: undefined;
    recommendedPlan?: unknown;
  } | null;
};

type ParentDashboardProfile = {
  id: string;
  userId: string;
  country: string;
  timezone: string;
  preferredContactMethod?: string | null;
  students: Array<{
    id: string;
    fullName: string;
    age: number;
    classYearGroup: string;
    countryOfStudy: string;
    curriculum: string;
    mainAcademicChallenge: string;
    academicGoal?: string | null;
    subjects?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
};

type TutorDashboardProfile = {
  id: string;
  userId: string;
  status: string;
  phone?: string | null;
  bio?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  subjects?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

type ParentPaymentRecord = AdminActivityPaymentRecord & {
  paymentMethod?: string;
  checkoutUrl?: string | null;
};

type ParentHomeworkRecord = {
  id: string;
  title: string;
  dueDate?: Date | null;
  status: string;
  student?: {
    fullName?: string;
  } | null;
};

type ParentReportRecord = {
  id: string;
  reportingMonth: Date;
  overallProgressStatus?: string;
  publishedAt?: Date | null;
  student?: {
    fullName?: string;
  } | null;
};

type ParentSupportRecord = {
  id: string;
  subject: string;
  status: string;
  updatedAt: Date;
};

type EnrollmentRecord = {
  id: string;
  status: string;
  student?: {
    id: string;
    fullName: string;
    classYearGroup?: string;
    curriculum?: string;
  } | null;
  tutoringPlan?: {
    name?: string;
  } | null;
};

type TutorReportRecord = {
  id: string;
  status: string;
  reportingMonth: Date;
  student?: {
    fullName?: string;
  } | null;
};

type TutorHomeworkRecord = {
  id: string;
  title: string;
  dueDate?: Date | null;
  status: string;
  student?: {
    fullName?: string;
  } | null;
};

function asClient(client: DashboardQueryClient = db as unknown as DashboardQueryClient) {
  return client;
}

function assertDashboardRole(user: AuthUser, expectedRole: DashboardRole): void {
  if (user.role !== expectedRole) {
    throw new AuthError("FORBIDDEN", "You do not have permission for this dashboard.");
  }
}

function amountToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "0";
  }

  if (typeof value === "object" && "toString" in value) {
    return value.toString();
  }

  return String(value);
}

function toNumber(value: unknown): number {
  const parsed = Number(amountToString(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTodayRange(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

function getCurrentMonthRange(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { start, end };
}

function isSameDay(value: Date, now: Date): boolean {
  const { start, end } = getTodayRange(now);
  return value >= start && value < end;
}

function isUpcomingLesson(lesson: DashboardLesson, now: Date): boolean {
  return lesson.startTime >= now && ["SCHEDULED", "RESCHEDULED"].includes(lesson.status);
}

function isLessonNeedingNotes(lesson: DashboardLesson, now: Date): boolean {
  return (
    ["SCHEDULED", "RESCHEDULED"].includes(lesson.status) &&
    lesson.startTime <= now &&
    !lesson.lessonNotes
  );
}

const parentAssessmentSelect = {
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
};

const parentLessonSelect = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  timezone: true,
  status: true,
  meetingLink: true,
  lessonNotes: true,
  student: { select: { id: true, fullName: true } },
  tutor: { select: { user: { select: { name: true } } } },
  subject: { select: { id: true, name: true, slug: true } }
};

const tutorLessonSelect = {
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
};

export async function getAdminRevenueSummary(
  client: DashboardQueryClient = db as unknown as DashboardQueryClient
) {
  const prisma = asClient(client);
  const [currencyRows, recentPaidPayments] = await Promise.all([
    prisma.payment?.groupBy?.({
      by: ["currency"],
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: { _all: true }
    }) ?? Promise.resolve([]),
    prisma.payment?.findMany?.({
      where: { status: "PAID" },
      select: {
        id: true,
        amount: true,
        currency: true,
        paidAt: true,
        parent: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        enrollment: {
          select: {
            student: {
              select: {
                fullName: true
              }
            },
            tutoringPlan: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { paidAt: "desc" },
      take: 5
    }) ?? Promise.resolve([])
  ]);

  const revenueByCurrency = (currencyRows as RevenueCurrencyRow[]).map((row) => ({
    currency: row.currency,
    amount: amountToString(row._sum?.amount),
    paidPayments: row._count?._all ?? 0
  }));

  return {
    totalPaidRevenue: revenueByCurrency.reduce(
      (total, row) => total + toNumber(row.amount),
      0
    ),
    paidPaymentCount: revenueByCurrency.reduce(
      (total, row) => total + row.paidPayments,
      0
    ),
    revenueByCurrency,
    recentPaidPayments: (recentPaidPayments as RecentPaidPaymentRecord[]).map((payment) => ({
      id: payment.id,
      amount: amountToString(payment.amount),
      currency: payment.currency,
      paidAt: payment.paidAt ?? null,
      parentName: payment.parent?.user?.name ?? "Parent not linked",
      childName: payment.enrollment?.student?.fullName ?? "Child not linked",
      planName: payment.enrollment?.tutoringPlan?.name ?? "Plan not linked"
    }))
  };
}

export async function getAdminConversionFunnel(
  client: DashboardQueryClient = db as unknown as DashboardQueryClient
) {
  const prisma = asClient(client);
  const [
    assessmentRequests,
    scheduledAssessments,
    completedAssessments,
    planRecommended,
    convertedAssessments,
    activeEnrollments
  ] = await Promise.all([
    prisma.assessmentRequest?.count?.({}) ?? Promise.resolve(0),
    prisma.assessmentRequest?.count?.({ where: { status: "SCHEDULED" } }) ??
      Promise.resolve(0),
    prisma.assessmentRequest?.count?.({ where: { status: "COMPLETED" } }) ??
      Promise.resolve(0),
    prisma.assessmentRequest?.count?.({
      where: { status: "PLAN_RECOMMENDED" }
    }) ?? Promise.resolve(0),
    prisma.assessmentRequest?.count?.({ where: { status: "CONVERTED" } }) ??
      Promise.resolve(0),
    prisma.enrollment?.count?.({ where: { status: "ACTIVE" } }) ??
      Promise.resolve(0)
  ]);

  return {
    assessmentRequests: toNumber(assessmentRequests),
    scheduledAssessments: toNumber(scheduledAssessments),
    completedAssessments: toNumber(completedAssessments),
    planRecommended: toNumber(planRecommended),
    convertedAssessments: toNumber(convertedAssessments),
    activeEnrollments: toNumber(activeEnrollments)
  };
}

export async function getAdminTutorWorkload(
  client: DashboardQueryClient = db as unknown as DashboardQueryClient
) {
  const prisma = asClient(client);
  const tutors =
    (await prisma.tutorProfile?.findMany?.({
      where: {
        user: {
          role: "TUTOR"
        }
      },
      select: {
        id: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            assignedEnrollments: true,
            lessons: true,
            homework: true,
            progressReports: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    })) ?? [];

  return (tutors as TutorWorkloadRecord[]).map((tutor) => ({
    tutorId: tutor.id,
    tutorName: tutor.user?.name ?? "Tutor not linked",
    status: tutor.status,
    assignedEnrollments: tutor._count?.assignedEnrollments ?? 0,
    lessons: tutor._count?.lessons ?? 0,
    homeworkAssigned: tutor._count?.homework ?? 0,
    reports: tutor._count?.progressReports ?? 0
  }));
}

export async function getAdminDashboardDataForUser(
  user: AuthUser,
  client: DashboardQueryClient = db as unknown as DashboardQueryClient,
  now = new Date()
) {
  assertDashboardRole(user, "ADMIN");
  const prisma = asClient(client);

  try {
  const [
    totalParents,
    totalStudents,
    activeEnrollments,
    pendingAssessments,
    paymentsAwaitingVerification,
    paidPayments,
    upcomingLessonsCount,
    completedLessons,
    openSupportRequests,
    reportsInReview,
    activeTutors,
    revenue,
    conversionFunnel,
    recentAssessmentRequests,
    recentPayments,
    upcomingLessons,
    supportQueue,
    reportsAwaitingReview,
    tutorWorkload,
    communicationLogs,
    notifications
  ] = await Promise.all([
    prisma.user?.count?.({ where: { role: "PARENT" } }) ?? Promise.resolve(0),
    prisma.studentProfile?.count?.({}) ?? Promise.resolve(0),
    prisma.enrollment?.count?.({ where: { status: "ACTIVE" } }) ??
      Promise.resolve(0),
    prisma.assessmentRequest?.count?.({ where: { status: "PENDING_REVIEW" } }) ??
      Promise.resolve(0),
    prisma.payment?.count?.({ where: { status: "AWAITING_VERIFICATION" } }) ??
      Promise.resolve(0),
    prisma.payment?.count?.({ where: { status: "PAID" } }) ?? Promise.resolve(0),
    prisma.lesson?.count?.({
      where: {
        status: "SCHEDULED",
        startTime: {
          gte: now
        }
      }
    }) ?? Promise.resolve(0),
    prisma.lesson?.count?.({ where: { status: "COMPLETED" } }) ??
      Promise.resolve(0),
    prisma.supportRequest?.count?.({ where: { status: "OPEN" } }) ??
      Promise.resolve(0),
    prisma.progressReport?.count?.({ where: { status: "REVIEW" } }) ??
      Promise.resolve(0),
    prisma.tutorProfile?.count?.({
      where: {
        status: "ACTIVE",
        user: {
          role: "TUTOR"
        }
      }
    }) ?? Promise.resolve(0),
    getAdminRevenueSummary(prisma),
    getAdminConversionFunnel(prisma),
    prisma.assessmentRequest?.findMany?.({
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        student: { select: { id: true, fullName: true } },
        parent: {
          select: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.payment?.findMany?.({
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        createdAt: true,
        parent: {
          select: {
            user: { select: { name: true, email: true } }
          }
        },
        student: { select: { id: true, fullName: true } },
        enrollment: {
          select: {
            student: { select: { id: true, fullName: true } },
            tutoringPlan: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.lesson?.findMany?.({
      where: {
        status: "SCHEDULED",
        startTime: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        timezone: true,
        status: true,
        student: { select: { id: true, fullName: true } },
        tutor: { select: { id: true, user: { select: { name: true } } } },
        subject: { select: { id: true, name: true } }
      },
      orderBy: { startTime: "asc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.supportRequest?.findMany?.({
      where: { status: "OPEN" },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        parent: {
          select: {
            user: { select: { name: true, email: true } }
          }
        },
        student: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.progressReport?.findMany?.({
      where: { status: "REVIEW" },
      select: {
        id: true,
        status: true,
        reportingMonth: true,
        createdAt: true,
        student: { select: { id: true, fullName: true } },
        tutor: { select: { id: true, user: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    getAdminTutorWorkload(prisma),
    prisma.communicationLog?.findMany?.({
      select: {
        id: true,
        parentId: true,
        studentId: true,
        assessmentRequestId: true,
        lessonId: true,
        paymentId: true,
        supportRequestId: true,
        type: true,
        message: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.notification?.findMany?.({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([])
  ]);

  const recentActivity = buildAdminActivityFeedFromRecords(
    {
      assessments: (recentAssessmentRequests as AdminActivityAssessmentRecord[]).map((assessment) => ({
        id: assessment.id,
        parentId: assessment.parentId ?? "",
        childName: assessment.student?.fullName,
        status: assessment.status,
        timestamp: assessment.updatedAt ?? assessment.createdAt ?? now
      })),
      payments: (recentPayments as AdminActivityPaymentRecord[]).map((payment) => ({
        id: payment.id,
        parentId: payment.parentId ?? "",
        childName: payment.student?.fullName ?? payment.enrollment?.student?.fullName,
        status: payment.status,
        amount: amountToString(payment.amount),
        currency: payment.currency,
        timestamp: payment.createdAt
      })),
      lessons: (upcomingLessons as AdminActivityLessonRecord[]).map((lesson) => ({
        id: lesson.id,
        parentId: lesson.parentId ?? "",
        tutorId: lesson.tutorId ?? "",
        childName: lesson.student?.fullName,
        subjectName: lesson.subject?.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.startTime
      })),
      supportRequests: (supportQueue as AdminActivitySupportRecord[]).map((support) => ({
        id: support.id,
        parentId: support.parentId ?? "",
        subject: support.subject,
        status: support.status,
        timestamp: support.createdAt
      })),
      reports: (reportsAwaitingReview as AdminActivityReportRecord[]).map((report) => ({
        id: report.id,
        parentId: report.parentId ?? "",
        tutorId: report.tutorId ?? "",
        childName: report.student?.fullName,
        status: report.status,
        timestamp: report.createdAt
      })),
      communicationLogs: (communicationLogs as CommunicationLogActivityRecord[]).map((log) => ({
        id: log.id,
        parentId: log.parentId,
        studentId: log.studentId,
        assessmentRequestId: log.assessmentRequestId,
        lessonId: log.lessonId,
        paymentId: log.paymentId,
        supportRequestId: log.supportRequestId,
        type: log.type,
        message: log.message,
        timestamp: log.createdAt
      })),
      notifications: (notifications as NotificationActivityRecord[]).map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    8
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    stats: {
      totalParents: toNumber(totalParents),
      totalStudents: toNumber(totalStudents),
      activeEnrollments: toNumber(activeEnrollments),
      pendingAssessments: toNumber(pendingAssessments),
      paymentsAwaitingVerification: toNumber(paymentsAwaitingVerification),
      paidPayments: toNumber(paidPayments),
      upcomingLessons: toNumber(upcomingLessonsCount),
      completedLessons: toNumber(completedLessons),
      openSupportRequests: toNumber(openSupportRequests),
      reportsInReview: toNumber(reportsInReview),
      activeTutors: toNumber(activeTutors)
    },
    revenue,
    conversionFunnel,
    recentAssessmentRequests:
      recentAssessmentRequests as AdminDashboardAssessmentItem[],
    recentPayments: recentPayments as AdminDashboardPaymentItem[],
    upcomingLessons: upcomingLessons as DashboardLesson[],
    openSupportRequests: supportQueue as AdminDashboardSupportItem[],
    reportsAwaitingReview: reportsAwaitingReview as AdminDashboardReportItem[],
    tutorWorkload,
    recentActivity
  };
  } catch (error) {
    console.error("Admin dashboard data failed to load:", error);
    return createEmptyAdminDashboard(user);
  }
}

export async function getCurrentParentDashboardDataForUser(
  user: AuthUser,
  client: DashboardQueryClient = db as unknown as DashboardQueryClient,
  now = new Date()
) {
  assertDashboardRole(user, "PARENT");
  const prisma = asClient(client);

  try {
  const parentProfileResult = await prisma.parentProfile?.findUnique?.({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      country: true,
      timezone: true,
      preferredContactMethod: true,
      students: {
        select: {
          id: true,
          fullName: true,
          age: true,
          classYearGroup: true,
          countryOfStudy: true,
          curriculum: true,
          mainAcademicChallenge: true,
          academicGoal: true,
          subjects: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!parentProfileResult) {
    return createEmptyParentDashboard(user);
  }

  const parentProfile = parentProfileResult as ParentDashboardProfile;

  const [
    assessments,
    enrollments,
    payments,
    lessons,
    homeworkDue,
    reports,
    supportRequests,
    notifications,
    unreadNotifications
  ] = await Promise.all([
    prisma.assessmentRequest?.findMany?.({
      where: { parentId: parentProfile.id },
      select: parentAssessmentSelect,
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.enrollment?.findMany?.({
      where: { parentId: parentProfile.id },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        student: { select: { id: true, fullName: true } },
        tutoringPlan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            currency: true,
            sessionsPerWeek: true
          }
        },
        payments: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            amount: true,
            currency: true,
            checkoutUrl: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    }) ?? Promise.resolve([]),
    prisma.payment?.findMany?.({
      where: { parentId: parentProfile.id },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        checkoutUrl: true,
        createdAt: true,
        student: { select: { id: true, fullName: true } },
        enrollment: {
          select: {
            id: true,
            student: { select: { id: true, fullName: true } },
            tutoringPlan: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }) ?? Promise.resolve([]),
    prisma.lesson?.findMany?.({
      where: { parentId: parentProfile.id },
      select: parentLessonSelect,
      orderBy: { startTime: "asc" },
      take: 20
    }) ?? Promise.resolve([]),
    prisma.homework?.findMany?.({
      where: {
        student: {
          parentId: parentProfile.id
        },
        status: {
          in: ["ASSIGNED", "OVERDUE"]
        }
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        student: { select: { id: true, fullName: true } },
        lesson: { select: { id: true, title: true } }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 5
    }) ?? Promise.resolve([]),
    prisma.progressReport?.findMany?.({
      where: {
        parentId: parentProfile.id,
        status: "PUBLISHED"
      },
      select: {
        id: true,
        reportingMonth: true,
        overallProgressStatus: true,
        publishedAt: true,
        student: { select: { id: true, fullName: true } },
        tutor: { select: { user: { select: { name: true } } } }
      },
      orderBy: { publishedAt: "desc" },
      take: 3
    }) ?? Promise.resolve([]),
    prisma.supportRequest?.findMany?.({
      where: {
        parentId: parentProfile.id,
        status: {
          in: ["OPEN", "IN_REVIEW"]
        }
      },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.notification?.findMany?.({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        readAt: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) ?? Promise.resolve([]),
    prisma.notification?.count?.({
      where: {
        userId: user.id,
        readAt: null
      }
    }) ?? Promise.resolve(0)
  ]);

  const lessonRecords = lessons as DashboardLesson[];
  const nextUpcomingLesson =
    lessonRecords.filter((lesson) => isUpcomingLesson(lesson, now))[0] ?? null;
  const recentCompletedLessonNote =
    [...lessonRecords]
      .filter((lesson) => lesson.status === "COMPLETED" && lesson.lessonNotes)
      .sort((left, right) => right.startTime.getTime() - left.startTime.getTime())[0] ??
    null;
  const parentAssessments = assessments as ParentAssessmentRecord[];
  const parentEnrollments = enrollments as EnrollmentRecord[];
  const parentPayments = payments as ParentPaymentRecord[];
  const parentHomeworkDue = homeworkDue as ParentHomeworkRecord[];
  const parentReports = reports as ParentReportRecord[];
  const parentSupportRequests = supportRequests as ParentSupportRecord[];
  const parentNotifications = notifications as NotificationActivityRecord[];
  const latestAssessment = parentAssessments[0] ?? null;
  const recommendedPlan =
    parentAssessments.find(
      (assessment) => assessment.outcome?.recommendedPlan
    )?.outcome?.recommendedPlan ?? null;
  const activeEnrollment =
    parentEnrollments.find((enrollment) => enrollment.status === "ACTIVE") ??
    null;
  const paymentStatusSummary = summarizePayments(parentPayments);
  const latestPublishedReport = parentReports[0] ?? null;
  const recentActivity = buildParentActivityFeedFromRecords(
    {
      assessments: parentAssessments.map((assessment) => ({
        id: assessment.id,
        parentId: parentProfile.id,
        childName: assessment.student?.fullName,
        status: assessment.status,
        timestamp: assessment.updatedAt ?? assessment.createdAt ?? now
      })),
      payments: parentPayments.map((payment) => ({
        id: payment.id,
        parentId: parentProfile.id,
        childName: payment.student?.fullName ?? payment.enrollment?.student?.fullName,
        status: payment.status,
        amount: amountToString(payment.amount),
        currency: payment.currency,
        timestamp: payment.createdAt
      })),
      lessons: lessonRecords.map((lesson) => ({
        id: lesson.id,
        parentId: parentProfile.id,
        tutorId: "",
        childName: lesson.student?.fullName,
        subjectName: lesson.subject?.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.startTime
      })),
      homework: parentHomeworkDue.map((homework) => ({
        id: homework.id,
        parentId: parentProfile.id,
        tutorId: "",
        childName: homework.student?.fullName,
        title: homework.title,
        status: homework.status,
        timestamp: homework.dueDate ?? now
      })),
      reports: parentReports.map((report) => ({
        id: report.id,
        parentId: parentProfile.id,
        tutorId: "",
        childName: report.student?.fullName,
        status: "PUBLISHED",
        timestamp: report.publishedAt ?? report.reportingMonth
      })),
      supportRequests: parentSupportRequests.map((support) => ({
        id: support.id,
        parentId: parentProfile.id,
        subject: support.subject,
        status: support.status,
        timestamp: support.updatedAt
      })),
      notifications: parentNotifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    parentProfile.id,
    8
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    parentProfileStatus: {
      hasParentProfile: true,
      hasChildren: parentProfile.students.length > 0,
      childrenCount: parentProfile.students.length,
      isComplete: parentProfile.students.length > 0
    },
    parentProfile: {
      id: parentProfile.id,
      country: parentProfile.country,
      timezone: parentProfile.timezone,
      preferredContactMethod: parentProfile.preferredContactMethod ?? null
    },
    childProfiles: parentProfile.students,
    latestAssessment,
    recommendedPlan,
    enrollments: parentEnrollments,
    activeEnrollment,
    paymentStatusSummary,
    nextUpcomingLesson,
    recentCompletedLessonNote,
    homeworkDue: parentHomeworkDue,
    latestPublishedReport,
    openSupportRequests: parentSupportRequests,
    notificationsSummary: {
      unreadCount: toNumber(unreadNotifications),
      recent: parentNotifications
    },
    recentActivity
  };
  } catch (error) {
    console.error("Parent dashboard data failed to load:", error);
    return createEmptyParentDashboard(user);
  }
}

export async function getCurrentTutorDashboardDataForUser(
  user: AuthUser,
  client: DashboardQueryClient = db as unknown as DashboardQueryClient,
  now = new Date()
) {
  assertDashboardRole(user, "TUTOR");
  const prisma = asClient(client);

  try {
  const tutorProfileResult = await prisma.tutorProfile?.findUnique?.({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      status: true,
      phone: true,
      bio: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      subjects: { select: { id: true, name: true, slug: true } }
    }
  });

  if (!tutorProfileResult) {
    return createEmptyTutorDashboard(user);
  }

  const tutorProfile = tutorProfileResult as TutorDashboardProfile;

  const { start: monthStart, end: monthEnd } = getCurrentMonthRange(now);
  const [lessons, homework, reports, assignedEnrollments, reportsDue, notifications, unreadNotifications] =
    await Promise.all([
      prisma.lesson?.findMany?.({
        where: { tutorId: tutorProfile.id },
        select: tutorLessonSelect,
        orderBy: { startTime: "asc" },
        take: 20
      }) ?? Promise.resolve([]),
      prisma.homework?.findMany?.({
        where: { tutorId: tutorProfile.id },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          student: {
            select: {
              id: true,
              fullName: true,
              classYearGroup: true
            }
          },
          lesson: { select: { id: true, title: true } }
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 10
      }) ?? Promise.resolve([]),
      prisma.progressReport?.findMany?.({
        where: { tutorId: tutorProfile.id },
        select: {
          id: true,
          status: true,
          reportingMonth: true,
          student: { select: { id: true, fullName: true } }
        },
        orderBy: { reportingMonth: "desc" },
        take: 10
      }) ?? Promise.resolve([]),
      prisma.enrollment?.findMany?.({
        where: {
          assignedTutorId: tutorProfile.id,
          status: "ACTIVE"
        },
        select: {
          id: true,
          student: {
            select: {
              id: true,
              fullName: true,
              classYearGroup: true,
              curriculum: true
            }
          },
          tutoringPlan: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }) ?? Promise.resolve([]),
      prisma.enrollment?.findMany?.({
        where: {
          assignedTutorId: tutorProfile.id,
          status: "ACTIVE",
          progressReports: {
            none: {
              reportingMonth: {
                gte: monthStart,
                lt: monthEnd
              }
            }
          }
        },
        select: {
          id: true,
          student: {
            select: {
              id: true,
              fullName: true,
              classYearGroup: true
            }
          },
          tutoringPlan: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }) ?? Promise.resolve([]),
      prisma.notification?.findMany?.({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          message: true,
          href: true,
          readAt: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      }) ?? Promise.resolve([]),
      prisma.notification?.count?.({
        where: {
          userId: user.id,
          readAt: null
        }
      }) ?? Promise.resolve(0)
    ]);

  const lessonRecords = lessons as DashboardLesson[];
  const tutorHomework = homework as TutorHomeworkRecord[];
  const todayLessons = lessonRecords.filter(
    (lesson) => isSameDay(lesson.startTime, now) && isUpcomingLesson(lesson, now)
  );
  const upcomingLessons = lessonRecords.filter(
    (lesson) => !isSameDay(lesson.startTime, now) && isUpcomingLesson(lesson, now)
  );
  const lessonsNeedingNotes = lessonRecords.filter((lesson) =>
    isLessonNeedingNotes(lesson, now)
  );
  const reportsList = reports as TutorReportRecord[];
  const tutorNotifications = notifications as NotificationActivityRecord[];
  const tutorAssignedEnrollments = assignedEnrollments as EnrollmentRecord[];
  const recentActivity = buildTutorActivityFeedFromRecords(
    {
      lessons: lessonRecords.map((lesson) => ({
        id: lesson.id,
        parentId: "",
        tutorId: tutorProfile.id,
        childName: lesson.student?.fullName,
        subjectName: lesson.subject?.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.startTime
      })),
      homework: tutorHomework.map((item) => ({
        id: item.id,
        parentId: "",
        tutorId: tutorProfile.id,
        childName: item.student?.fullName,
        title: item.title,
        status: item.status,
        timestamp: item.dueDate ?? now
      })),
      reports: reportsList.map((report) => ({
        id: report.id,
        parentId: "",
        tutorId: tutorProfile.id,
        childName: report.student?.fullName,
        status: report.status,
        timestamp: report.reportingMonth
      })),
      notifications: tutorNotifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    tutorProfile.id,
    8
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tutorProfile,
    todayLessons,
    upcomingLessons,
    lessonsNeedingNotes,
    assignedStudents: tutorAssignedEnrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      ...enrollment.student,
      planName: enrollment.tutoringPlan?.name ?? "Plan not linked"
    })),
    homeworkAssigned: tutorHomework,
    reports: {
      draft: reportsList.filter((report) => report.status === "DRAFT"),
      inReview: reportsList.filter((report) => report.status === "REVIEW"),
      published: reportsList.filter((report) => report.status === "PUBLISHED"),
      due: reportsDue as EnrollmentRecord[]
    },
    notificationsSummary: {
      unreadCount: toNumber(unreadNotifications),
      recent: tutorNotifications
    },
    recentActivity
  };
  } catch (error) {
    console.error("Tutor dashboard data failed to load:", error);
    return createEmptyTutorDashboard(user);
  }
}

export async function getAdminDashboardData() {
  const user = await requireAdmin();
  return getAdminDashboardDataForUser(user);
}

export async function getCurrentParentDashboardData() {
  const user = await requireParent();
  return getCurrentParentDashboardDataForUser(user);
}

export async function getCurrentTutorDashboardData() {
  const user = await requireTutor();
  return getCurrentTutorDashboardDataForUser(user);
}

function summarizePayments(payments: ParentPaymentRecord[]) {
  return payments.reduce(
    (summary, payment) => {
      if (payment.status === "PENDING") summary.pending += 1;
      if (payment.status === "AWAITING_VERIFICATION") {
        summary.awaitingVerification += 1;
      }
      if (payment.status === "PAID") summary.paid += 1;
      if (payment.status === "FAILED") summary.failed += 1;
      return summary;
    },
    {
      pending: 0,
      awaitingVerification: 0,
      paid: 0,
      failed: 0
    }
  );
}

function createEmptyAdminDashboard(user: AuthUser) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
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
    recentActivity: [] as ActivityFeedItem[]
  };
}

function createEmptyParentDashboard(user: AuthUser) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
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
    recentActivity: [] as ActivityFeedItem[]
  };
}

function createEmptyTutorDashboard(user: AuthUser) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tutorProfile: null,
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
    recentActivity: [] as ActivityFeedItem[]
  };
}
