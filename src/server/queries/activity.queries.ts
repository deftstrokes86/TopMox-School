import { requireAdmin, requireParent, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildAdminActivityFeedFromRecords,
  buildParentActivityFeedFromRecords,
  buildTutorActivityFeedFromRecords,
  type ActivityFeedItem
} from "@/lib/utils/activity-feed";

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return 8;
  }

  return Math.max(1, Math.min(limit, 20));
}

export async function getAdminActivityFeed(
  limit = 8
): Promise<ActivityFeedItem[]> {
  const user = await requireAdmin();
  const take = normalizeLimit(limit);

  const [
    assessments,
    payments,
    lessons,
    homework,
    reports,
    supportRequests,
    communicationLogs,
    notifications
  ] = await Promise.all([
    db.assessmentRequest.findMany({
      select: {
        id: true,
        parentId: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.payment.findMany({
      select: {
        id: true,
        parentId: true,
        status: true,
        amount: true,
        currency: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        },
        enrollment: {
          select: {
            student: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.lesson.findMany({
      select: {
        id: true,
        parentId: true,
        tutorId: true,
        title: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.homework.findMany({
      select: {
        id: true,
        tutorId: true,
        title: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            parentId: true,
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.progressReport.findMany({
      select: {
        id: true,
        parentId: true,
        tutorId: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.supportRequest.findMany({
      select: {
        id: true,
        parentId: true,
        subject: true,
        status: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.communicationLog.findMany({
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
      orderBy: {
        createdAt: "desc"
      },
      take
    }),
    db.notification.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take
    })
  ]);

  return buildAdminActivityFeedFromRecords(
    {
      assessments: assessments.map((assessment) => ({
        id: assessment.id,
        parentId: assessment.parentId,
        childName: assessment.student.fullName,
        status: assessment.status,
        timestamp: assessment.updatedAt
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        parentId: payment.parentId,
        childName:
          payment.student?.fullName ?? payment.enrollment?.student.fullName,
        status: payment.status,
        amount: payment.amount.toString(),
        currency: payment.currency,
        timestamp: payment.updatedAt
      })),
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        parentId: lesson.parentId,
        tutorId: lesson.tutorId,
        childName: lesson.student.fullName,
        subjectName: lesson.subject.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.updatedAt
      })),
      homework: homework.map((item) => ({
        id: item.id,
        parentId: item.student.parentId,
        tutorId: item.tutorId,
        childName: item.student.fullName,
        title: item.title,
        status: item.status,
        timestamp: item.updatedAt
      })),
      reports: reports.map((report) => ({
        id: report.id,
        parentId: report.parentId,
        tutorId: report.tutorId,
        childName: report.student.fullName,
        status: report.status,
        timestamp: report.publishedAt ?? report.updatedAt
      })),
      supportRequests: supportRequests.map((supportRequest) => ({
        id: supportRequest.id,
        parentId: supportRequest.parentId,
        subject: supportRequest.subject,
        status: supportRequest.status,
        timestamp: supportRequest.updatedAt
      })),
      communicationLogs: communicationLogs.map((log) => ({
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
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    take
  );
}

export async function getCurrentParentActivityFeed(
  limit = 8
): Promise<ActivityFeedItem[]> {
  const user = await requireParent();
  const take = normalizeLimit(limit);
  const parent = await db.parentProfile.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true
    }
  });

  if (!parent) {
    return [];
  }

  const [assessments, payments, lessons, homework, reports, supportRequests, notifications] =
    await Promise.all([
      db.assessmentRequest.findMany({
        where: {
          parentId: parent.id
        },
        select: {
          id: true,
          parentId: true,
          status: true,
          updatedAt: true,
          student: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.payment.findMany({
        where: {
          parentId: parent.id
        },
        select: {
          id: true,
          parentId: true,
          status: true,
          amount: true,
          currency: true,
          updatedAt: true,
          student: {
            select: {
              fullName: true
            }
          },
          enrollment: {
            select: {
              student: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.lesson.findMany({
        where: {
          parentId: parent.id
        },
        select: {
          id: true,
          parentId: true,
          tutorId: true,
          title: true,
          status: true,
          updatedAt: true,
          student: {
            select: {
              fullName: true
            }
          },
          subject: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.homework.findMany({
        where: {
          student: {
            parentId: parent.id
          }
        },
        select: {
          id: true,
          tutorId: true,
          title: true,
          status: true,
          updatedAt: true,
          student: {
            select: {
              parentId: true,
              fullName: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.progressReport.findMany({
        where: {
          parentId: parent.id,
          status: "PUBLISHED"
        },
        select: {
          id: true,
          parentId: true,
          tutorId: true,
          status: true,
          publishedAt: true,
          updatedAt: true,
          student: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.supportRequest.findMany({
        where: {
          parentId: parent.id
        },
        select: {
          id: true,
          parentId: true,
          subject: true,
          status: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: "desc"
        },
        take
      }),
      db.notification.findMany({
        where: {
          userId: user.id
        },
        select: {
          id: true,
          title: true,
          message: true,
          href: true,
          createdAt: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take
      })
    ]);

  return buildParentActivityFeedFromRecords(
    {
      assessments: assessments.map((assessment) => ({
        id: assessment.id,
        parentId: assessment.parentId,
        childName: assessment.student.fullName,
        status: assessment.status,
        timestamp: assessment.updatedAt
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        parentId: payment.parentId,
        childName:
          payment.student?.fullName ?? payment.enrollment?.student.fullName,
        status: payment.status,
        amount: payment.amount.toString(),
        currency: payment.currency,
        timestamp: payment.updatedAt
      })),
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        parentId: lesson.parentId,
        tutorId: lesson.tutorId,
        childName: lesson.student.fullName,
        subjectName: lesson.subject.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.updatedAt
      })),
      homework: homework.map((item) => ({
        id: item.id,
        parentId: item.student.parentId,
        tutorId: item.tutorId,
        childName: item.student.fullName,
        title: item.title,
        status: item.status,
        timestamp: item.updatedAt
      })),
      reports: reports.map((report) => ({
        id: report.id,
        parentId: report.parentId,
        tutorId: report.tutorId,
        childName: report.student.fullName,
        status: report.status,
        timestamp: report.publishedAt ?? report.updatedAt
      })),
      supportRequests: supportRequests.map((supportRequest) => ({
        id: supportRequest.id,
        parentId: supportRequest.parentId,
        subject: supportRequest.subject,
        status: supportRequest.status,
        timestamp: supportRequest.updatedAt
      })),
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    parent.id,
    take
  );
}

export async function getCurrentTutorActivityFeed(
  limit = 8
): Promise<ActivityFeedItem[]> {
  const user = await requireTutor();
  const take = normalizeLimit(limit);
  const tutor = await db.tutorProfile.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true
    }
  });

  if (!tutor) {
    return [];
  }

  const [lessons, homework, reports, notifications] = await Promise.all([
    db.lesson.findMany({
      where: {
        tutorId: tutor.id
      },
      select: {
        id: true,
        parentId: true,
        tutorId: true,
        title: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.homework.findMany({
      where: {
        tutorId: tutor.id
      },
      select: {
        id: true,
        tutorId: true,
        title: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            parentId: true,
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.progressReport.findMany({
      where: {
        tutorId: tutor.id
      },
      select: {
        id: true,
        parentId: true,
        tutorId: true,
        status: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take
    }),
    db.notification.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take
    })
  ]);

  return buildTutorActivityFeedFromRecords(
    {
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        parentId: lesson.parentId,
        tutorId: lesson.tutorId,
        childName: lesson.student.fullName,
        subjectName: lesson.subject.name,
        title: lesson.title,
        status: lesson.status,
        timestamp: lesson.updatedAt
      })),
      homework: homework.map((item) => ({
        id: item.id,
        parentId: item.student.parentId,
        tutorId: item.tutorId,
        childName: item.student.fullName,
        title: item.title,
        status: item.status,
        timestamp: item.updatedAt
      })),
      reports: reports.map((report) => ({
        id: report.id,
        parentId: report.parentId,
        tutorId: report.tutorId,
        childName: report.student.fullName,
        status: report.status,
        timestamp: report.updatedAt
      })),
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        timestamp: notification.createdAt
      }))
    },
    tutor.id,
    take
  );
}
