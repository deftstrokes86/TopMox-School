"use server";

import type { ProgressStatus, ReportStatus } from "@prisma/client";

import { AuthError, requireAdmin, requireAuth, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createProgressReportSchema,
  updateProgressReportSchema,
  updateReportStatusSchema,
  type CreateProgressReportInput,
  type UpdateProgressReportInput,
  type UpdateReportStatusInput
} from "@/lib/validations/report.schema";
import {
  ReportAccessError,
  ReportStatusTransitionError,
  assertReportStatusTransition,
  assertTutorCanReportOnStudent,
  publishProgressReport
} from "@/server/services/report.service";

type ReportFieldErrors = Partial<
  Record<
    | keyof CreateProgressReportInput
    | keyof UpdateProgressReportInput
    | keyof UpdateReportStatusInput,
    string
  >
>;

type ReportIdInput = Pick<UpdateReportStatusInput, "reportId">;

export type ReportActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: ReportFieldErrors;
  data?: {
    reportId: string;
    status: ReportStatus;
    overallProgressStatus?: ProgressStatus;
  };
};

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED" ? "Authentication required." : deniedMessage
    } satisfies ReportActionResult;
  }

  return null;
}

function toReportErrorResult(error: unknown) {
  if (
    error instanceof ReportAccessError ||
    error instanceof ReportStatusTransitionError
  ) {
    return {
      success: false,
      message: error.message
    } satisfies ReportActionResult;
  }

  return null;
}

function createReportFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
) {
  return {
    studentId: fieldErrors.studentId?.[0],
    enrollmentId: fieldErrors.enrollmentId?.[0],
    reportingMonth: fieldErrors.reportingMonth?.[0],
    subjectsCovered: fieldErrors.subjectsCovered?.[0],
    attendanceSummary: fieldErrors.attendanceSummary?.[0],
    strengths: fieldErrors.strengths?.[0],
    areasNeedingImprovement: fieldErrors.areasNeedingImprovement?.[0],
    homeworkCompletion: fieldErrors.homeworkCompletion?.[0],
    tutorComments: fieldErrors.tutorComments?.[0],
    recommendedNextSteps: fieldErrors.recommendedNextSteps?.[0],
    parentActionPoints: fieldErrors.parentActionPoints?.[0],
    overallProgressStatus: fieldErrors.overallProgressStatus?.[0]
  } satisfies ReportFieldErrors;
}

export async function createProgressReportAction(
  payload: CreateProgressReportInput
): Promise<ReportActionResult> {
  try {
    const parsed = createProgressReportSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the report fields and try again.",
        fieldErrors: createReportFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireTutor();

    const result = await db.$transaction(async (tx) => {
      const [tutor, student] = await Promise.all([
        tx.tutorProfile.findUnique({
          where: {
            userId: user.id
          },
          select: {
            id: true
          }
        }),
        tx.studentProfile.findUnique({
          where: {
            id: parsed.data.studentId
          },
          select: {
            id: true,
            parentId: true
          }
        })
      ]);

      if (!student) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Student not found.",
            fieldErrors: {
              studentId: "Student not found."
            }
          } satisfies ReportActionResult
        };
      }

      const [assignedEnrollment, assignedLesson] = tutor
        ? await Promise.all([
            tx.enrollment.findFirst({
              where: {
                ...(parsed.data.enrollmentId
                  ? { id: parsed.data.enrollmentId }
                  : {}),
                studentId: student.id,
                assignedTutorId: tutor.id,
                status: "ACTIVE"
              },
              select: {
                id: true
              }
            }),
            tx.lesson.findFirst({
              where: {
                studentId: student.id,
                tutorId: tutor.id
              },
              select: {
                id: true
              }
            })
          ])
        : [null, null];

      assertTutorCanReportOnStudent({
        tutorExists: Boolean(tutor),
        hasActiveAssignedEnrollment: Boolean(assignedEnrollment),
        hasAssignedLesson: Boolean(assignedLesson)
      });

      if (parsed.data.enrollmentId && !assignedEnrollment) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Enrollment is not available for this report.",
            fieldErrors: {
              enrollmentId: "Enrollment is not available for this report."
            }
          } satisfies ReportActionResult
        };
      }

      const report = await tx.progressReport.create({
        data: {
          parentId: student.parentId,
          studentId: student.id,
          tutorId: tutor!.id,
          enrollmentId: assignedEnrollment?.id ?? null,
          reportingMonth: parsed.data.reportingMonth,
          subjectsCovered: parsed.data.subjectsCovered.trim(),
          attendanceSummary: parsed.data.attendanceSummary.trim(),
          strengths: parsed.data.strengths.trim(),
          areasNeedingImprovement:
            parsed.data.areasNeedingImprovement.trim(),
          homeworkCompletion: parsed.data.homeworkCompletion.trim(),
          tutorComments: parsed.data.tutorComments.trim(),
          recommendedNextSteps: parsed.data.recommendedNextSteps.trim(),
          parentActionPoints: parsed.data.parentActionPoints.trim(),
          overallProgressStatus: parsed.data.overallProgressStatus,
          status: "DRAFT"
        },
        select: {
          id: true,
          status: true,
          overallProgressStatus: true
        }
      });

      return {
        kind: "success" as const,
        report
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Progress report drafted.",
      data: {
        reportId: result.report.id,
        status: result.report.status,
        overallProgressStatus: result.report.overallProgressStatus
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only assigned tutors can draft progress reports."
    );
    if (authResult) {
      return authResult;
    }

    const reportResult = toReportErrorResult(error);
    if (reportResult) {
      return reportResult;
    }

    throw error;
  }
}

export async function submitProgressReportForReviewAction(
  payload: ReportIdInput
): Promise<ReportActionResult> {
  try {
    const parsed = updateReportStatusSchema.safeParse({
      ...payload,
      status: "REVIEW"
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid report.",
        fieldErrors: {
          reportId: parsed.error.flatten().fieldErrors.reportId?.[0]
        }
      };
    }

    const user = await requireTutor();

    const result = await db.$transaction(async (tx) => {
      const report = await tx.progressReport.findFirst({
        where: {
          id: parsed.data.reportId,
          tutor: {
            userId: user.id
          }
        },
        select: {
          id: true,
          status: true
        }
      });

      if (!report) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Report not found."
          } satisfies ReportActionResult
        };
      }

      assertReportStatusTransition(report.status, "REVIEW");

      const updated = await tx.progressReport.update({
        where: {
          id: report.id
        },
        data: {
          status: "REVIEW"
        },
        select: {
          id: true,
          status: true
        }
      });

      return {
        kind: "success" as const,
        report: updated
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Progress report submitted for admin review.",
      data: {
        reportId: result.report.id,
        status: result.report.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only the assigned tutor can submit this report."
    );
    if (authResult) {
      return authResult;
    }

    const reportResult = toReportErrorResult(error);
    if (reportResult) {
      return reportResult;
    }

    throw error;
  }
}

export async function updateProgressReportAction(
  payload: UpdateProgressReportInput
): Promise<ReportActionResult> {
  try {
    const parsed = updateProgressReportSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the report fields and try again.",
        fieldErrors: {
          reportId: flattened.reportId?.[0],
          ...createReportFieldErrors(flattened)
        }
      };
    }

    const user = await requireAuth();

    const result = await db.$transaction(async (tx) => {
      const report = await tx.progressReport.findFirst({
        where: {
          id: parsed.data.reportId,
          ...(user.role === "TUTOR"
            ? {
                tutor: {
                  userId: user.id
                }
              }
            : {})
        },
        select: {
          id: true,
          status: true
        }
      });

      if (!report || (user.role !== "TUTOR" && user.role !== "ADMIN")) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Report not found."
          } satisfies ReportActionResult
        };
      }

      if (report.status === "PUBLISHED") {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Published reports cannot be edited in this phase."
          } satisfies ReportActionResult
        };
      }

      if (user.role === "TUTOR" && report.status !== "DRAFT") {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Tutors can only edit draft reports."
          } satisfies ReportActionResult
        };
      }

      const updated = await tx.progressReport.update({
        where: {
          id: report.id
        },
        data: {
          reportingMonth: parsed.data.reportingMonth,
          subjectsCovered: parsed.data.subjectsCovered.trim(),
          attendanceSummary: parsed.data.attendanceSummary.trim(),
          strengths: parsed.data.strengths.trim(),
          areasNeedingImprovement:
            parsed.data.areasNeedingImprovement.trim(),
          homeworkCompletion: parsed.data.homeworkCompletion.trim(),
          tutorComments: parsed.data.tutorComments.trim(),
          recommendedNextSteps: parsed.data.recommendedNextSteps.trim(),
          parentActionPoints: parsed.data.parentActionPoints.trim(),
          overallProgressStatus: parsed.data.overallProgressStatus
        },
        select: {
          id: true,
          status: true,
          overallProgressStatus: true
        }
      });

      return {
        kind: "success" as const,
        report: updated
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Progress report updated.",
      data: {
        reportId: result.report.id,
        status: result.report.status,
        overallProgressStatus: result.report.overallProgressStatus
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You cannot update this progress report."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function publishProgressReportAction(
  payload: ReportIdInput
): Promise<ReportActionResult> {
  try {
    const parsed = updateReportStatusSchema.safeParse({
      ...payload,
      status: "PUBLISHED"
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid report.",
        fieldErrors: {
          reportId: parsed.error.flatten().fieldErrors.reportId?.[0]
        }
      };
    }

    await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const report = await tx.progressReport.findUnique({
        where: {
          id: parsed.data.reportId
        },
        select: {
          id: true,
          status: true,
          parent: {
            select: {
              userId: true
            }
          }
        }
      });

      if (!report) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Report not found."
          } satisfies ReportActionResult
        };
      }

      assertReportStatusTransition(report.status, "PUBLISHED");

      const published = await publishProgressReport(tx, {
        reportId: report.id,
        parentUserId: report.parent.userId
      });

      return {
        kind: "success" as const,
        report: published
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Progress report published.",
      data: {
        reportId: result.report.id,
        status: result.report.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can publish progress reports."
    );
    if (authResult) {
      return authResult;
    }

    const reportResult = toReportErrorResult(error);
    if (reportResult) {
      return reportResult;
    }

    throw error;
  }
}

export async function returnProgressReportToDraftAction(
  payload: ReportIdInput
): Promise<ReportActionResult> {
  try {
    const parsed = updateReportStatusSchema.safeParse({
      ...payload,
      status: "DRAFT"
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid report.",
        fieldErrors: {
          reportId: parsed.error.flatten().fieldErrors.reportId?.[0]
        }
      };
    }

    await requireAdmin();

    const result = await db.$transaction(async (tx) => {
      const report = await tx.progressReport.findUnique({
        where: {
          id: parsed.data.reportId
        },
        select: {
          id: true,
          status: true
        }
      });

      if (!report) {
        return {
          kind: "error" as const,
          result: {
            success: false,
            message: "Report not found."
          } satisfies ReportActionResult
        };
      }

      assertReportStatusTransition(report.status, "DRAFT");

      const updated = await tx.progressReport.update({
        where: {
          id: report.id
        },
        data: {
          status: "DRAFT",
          publishedAt: null
        },
        select: {
          id: true,
          status: true
        }
      });

      return {
        kind: "success" as const,
        report: updated
      };
    });

    if (result.kind === "error") {
      return result.result;
    }

    return {
      success: true,
      message: "Progress report returned to draft.",
      data: {
        reportId: result.report.id,
        status: result.report.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "Only admins can return progress reports to draft."
    );
    if (authResult) {
      return authResult;
    }

    const reportResult = toReportErrorResult(error);
    if (reportResult) {
      return reportResult;
    }

    throw error;
  }
}
