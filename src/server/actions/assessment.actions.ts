"use server";

import type { AssessmentStatus } from "@prisma/client";

import { AuthError, requireAdmin, requireParent } from "@/lib/auth";
import { SUPPORT_SUBJECT_OPTIONS } from "@/lib/constants/subjects";
import { db } from "@/lib/db";
import {
  createAssessmentRequestSchema,
  assessmentOutcomeSchema,
  scheduleAssessmentSchema,
  updateAssessmentInternalNotesSchema,
  updateAssessmentStatusSchema,
  type AssessmentOutcomeInput,
  type CreateAssessmentRequestInput,
  type ScheduleAssessmentInput,
  type UpdateAssessmentInternalNotesInput,
  type UpdateAssessmentStatusInput
} from "@/lib/validations/assessment.schema";
import {
  AssessmentStatusTransitionError,
  assertAssessmentStatusTransition,
  canRecordAssessmentOutcome,
  getPlanRecommendedNotificationPayload,
  shouldPublishAssessmentRecommendation
} from "@/server/services/assessment.service";
import {
  createNotification,
  notifyAdmins
} from "@/server/services/notification.service";

type AssessmentFieldErrors = Partial<
  Record<
    | keyof CreateAssessmentRequestInput
    | keyof ScheduleAssessmentInput
    | keyof AssessmentOutcomeInput
    | keyof UpdateAssessmentInternalNotesInput
    | keyof UpdateAssessmentStatusInput,
    string
  >
>;

export type AssessmentActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: AssessmentFieldErrors;
  data?: {
    assessmentRequestId: string;
    status?: AssessmentStatus;
    outcomeId?: string;
  };
};

type ResolvedSubjects =
  | {
      success: true;
      subjectIds: string[];
    }
  | {
      success: false;
      message: string;
      fieldErrors: AssessmentFieldErrors;
    };

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : deniedMessage
    } satisfies AssessmentActionResult;
  }

  return null;
}

function toTransitionErrorResult(error: unknown) {
  if (error instanceof AssessmentStatusTransitionError) {
    return {
      success: false,
      message: error.message
    } satisfies AssessmentActionResult;
  }

  return null;
}

function getStatusNotification(status: AssessmentStatus) {
  switch (status) {
    case "SCHEDULED":
      return {
        type: "ASSESSMENT_SCHEDULED" as const,
        title: "Your child assessment has been scheduled.",
        message:
          "TopMox has scheduled your child assessment. Please review the details in your parent dashboard."
      };
    case "COMPLETED":
      return {
        type: "ASSESSMENT_COMPLETED" as const,
        title: "Your child assessment has been completed.",
        message:
          "TopMox has marked the assessment as completed. The next step is an academic recommendation."
      };
    case "DECLINED":
      return {
        type: "ASSESSMENT_DECLINED" as const,
        title: "Your assessment request has been updated.",
        message:
          "TopMox has updated your assessment request status. Please contact support if you need clarification."
      };
    default:
      return null;
  }
}

async function resolveAssessmentSubjectIds(
  payload: Pick<CreateAssessmentRequestInput, "subjectIds" | "subjects">
): Promise<ResolvedSubjects> {
  const subjectIds = Array.from(new Set(payload.subjectIds ?? []));
  const subjectLabels = Array.from(
    new Set(
      (payload.subjects ?? [])
        .map((subject) => subject.trim())
        .filter((subject) => subject.length > 0)
    )
  );

  const resolvedIds = new Set<string>();

  if (subjectIds.length > 0) {
    const existingSubjects = await db.subject.findMany({
      where: {
        id: {
          in: subjectIds
        }
      },
      select: {
        id: true
      }
    });

    if (existingSubjects.length !== subjectIds.length) {
      return {
        success: false,
        message: "Some selected subjects could not be found.",
        fieldErrors: {
          subjectIds: "Some selected subjects could not be found."
        }
      };
    }

    for (const subject of existingSubjects) {
      resolvedIds.add(subject.id);
    }
  }

  if (subjectLabels.length > 0) {
    const supportedSubjectMap = new Map<
      string,
      { slug: string; name: string; description: string }
    >();

    for (const subject of SUPPORT_SUBJECT_OPTIONS) {
      supportedSubjectMap.set(subject.slug.toLowerCase(), subject);
      supportedSubjectMap.set(subject.name.toLowerCase(), subject);
    }

    for (const label of subjectLabels) {
      const subject = supportedSubjectMap.get(label.toLowerCase());

      if (!subject) {
        return {
          success: false,
          message: "Some selected subjects are not available yet.",
          fieldErrors: {
            subjects: `Unknown subject: ${label}`
          }
        };
      }

      const resolvedSubject = await db.subject.upsert({
        where: { slug: subject.slug },
        update: {
          name: subject.name,
          description: subject.description
        },
        create: {
          slug: subject.slug,
          name: subject.name,
          description: subject.description
        },
        select: {
          id: true
        }
      });

      resolvedIds.add(resolvedSubject.id);
    }
  }

  if (resolvedIds.size === 0) {
    return {
      success: false,
      message: "At least one subject is required.",
      fieldErrors: {
        subjects: "At least one subject is required."
      }
    };
  }

  return {
    success: true,
    subjectIds: [...resolvedIds]
  };
}

export async function createAssessmentRequestAction(
  payload: CreateAssessmentRequestInput
): Promise<AssessmentActionResult> {
  try {
    const parsed = createAssessmentRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the assessment request fields and try again.",
        fieldErrors: {
          studentId: flattened.studentId?.[0],
          subjectIds: flattened.subjectIds?.[0],
          subjects: flattened.subjects?.[0],
          academicConcern: flattened.academicConcern?.[0],
          preferredAssessmentDate: flattened.preferredAssessmentDate?.[0],
          preferredAssessmentTime: flattened.preferredAssessmentTime?.[0],
          timezone: flattened.timezone?.[0],
          notes: flattened.notes?.[0]
        }
      };
    }

    const user = await requireParent();
    const child = await db.studentProfile.findFirst({
      where: {
        id: parsed.data.studentId,
        parent: {
          userId: user.id
        }
      },
      select: {
        id: true,
        fullName: true,
        parentId: true
      }
    });

    if (!child) {
      return {
        success: false,
        message: "Child profile not found or you do not have access to it.",
        fieldErrors: {
          studentId: "Child profile not found."
        }
      };
    }

    const resolvedSubjects = await resolveAssessmentSubjectIds(parsed.data);
    if (!resolvedSubjects.success) {
      return resolvedSubjects;
    }

    const assessment = await db.assessmentRequest.create({
      data: {
        parentId: child.parentId,
        studentId: child.id,
        status: "PENDING_REVIEW",
        academicConcern: parsed.data.academicConcern.trim(),
        preferredAssessmentDate: parsed.data.preferredAssessmentDate,
        preferredAssessmentTime: parsed.data.preferredAssessmentTime.trim(),
        timezone: parsed.data.timezone.trim(),
        notes: normalizeOptionalText(parsed.data.notes),
        subjects: {
          connect: resolvedSubjects.subjectIds.map((subjectId) => ({
            id: subjectId
          }))
        }
      },
      select: {
        id: true,
        status: true
      }
    });

    await Promise.all([
      notifyAdmins({
        type: "ASSESSMENT_SUBMITTED",
        title: "New assessment request submitted.",
        message: `${user.name} submitted a child assessment request for ${child.fullName}.`,
        href: "/admin/assessments"
      }),
      createNotification({
        userId: user.id,
        type: "ASSESSMENT_SUBMITTED",
        title: "Your assessment request has been received.",
        message:
          "TopMox has received your child assessment request. An academic coordinator will review it and follow up with next steps.",
        href: "/parent/assessments"
      })
    ]);

    return {
      success: true,
      message: "Assessment request submitted successfully.",
      data: {
        assessmentRequestId: assessment.id,
        status: assessment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to submit assessment requests."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function scheduleAssessmentAction(
  payload: ScheduleAssessmentInput
): Promise<AssessmentActionResult> {
  try {
    const parsed = scheduleAssessmentSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the assessment schedule fields and try again.",
        fieldErrors: {
          assessmentRequestId: flattened.assessmentRequestId?.[0],
          scheduledAt: flattened.scheduledAt?.[0],
          meetingLink: flattened.meetingLink?.[0],
          internalNotes: flattened.internalNotes?.[0]
        }
      };
    }

    await requireAdmin();
    const assessment = await db.assessmentRequest.findUnique({
      where: { id: parsed.data.assessmentRequestId },
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

    if (!assessment) {
      return {
        success: false,
        message: "Assessment request not found."
      };
    }

    assertAssessmentStatusTransition(assessment.status, "SCHEDULED");

    const updatedAssessment = await db.assessmentRequest.update({
      where: { id: assessment.id },
      data: {
        status: "SCHEDULED",
        scheduledAt: parsed.data.scheduledAt,
        meetingLink: normalizeOptionalText(parsed.data.meetingLink),
        internalNotes: normalizeOptionalText(parsed.data.internalNotes)
      },
      select: {
        id: true,
        status: true
      }
    });

    await createNotification({
      userId: assessment.parent.userId,
      type: "ASSESSMENT_SCHEDULED",
      title: "Your child assessment has been scheduled.",
      message:
        "TopMox has scheduled your child assessment. Please review the assessment details in your parent dashboard.",
      href: "/parent/assessments"
    });

    return {
      success: true,
      message: "Assessment scheduled successfully.",
      data: {
        assessmentRequestId: updatedAssessment.id,
        status: updatedAssessment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to schedule assessments."
    );
    if (authResult) {
      return authResult;
    }

    const transitionResult = toTransitionErrorResult(error);
    if (transitionResult) {
      return transitionResult;
    }

    throw error;
  }
}

export async function updateAssessmentStatusAction(
  payload: UpdateAssessmentStatusInput
): Promise<AssessmentActionResult> {
  try {
    const parsed = updateAssessmentStatusSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the assessment status fields and try again.",
        fieldErrors: {
          assessmentRequestId: flattened.assessmentRequestId?.[0],
          status: flattened.status?.[0],
          internalNotes: flattened.internalNotes?.[0]
        }
      };
    }

    await requireAdmin();
    const assessment = await db.assessmentRequest.findUnique({
      where: { id: parsed.data.assessmentRequestId },
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

    if (!assessment) {
      return {
        success: false,
        message: "Assessment request not found."
      };
    }

    assertAssessmentStatusTransition(assessment.status, parsed.data.status);

    const updatedAssessment = await db.assessmentRequest.update({
      where: { id: assessment.id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.internalNotes !== undefined
          ? { internalNotes: normalizeOptionalText(parsed.data.internalNotes) }
          : {})
      },
      select: {
        id: true,
        status: true
      }
    });

    const notification = getStatusNotification(updatedAssessment.status);
    if (notification) {
      await createNotification({
        userId: assessment.parent.userId,
        ...notification,
        href: "/parent/assessments"
      });
    }

    return {
      success: true,
      message: "Assessment status updated successfully.",
      data: {
        assessmentRequestId: updatedAssessment.id,
        status: updatedAssessment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to update assessment status."
    );
    if (authResult) {
      return authResult;
    }

    const transitionResult = toTransitionErrorResult(error);
    if (transitionResult) {
      return transitionResult;
    }

    throw error;
  }
}

export async function markAssessmentCompletedAction(
  assessmentRequestId: string
): Promise<AssessmentActionResult> {
  return updateAssessmentStatusAction({
    assessmentRequestId,
    status: "COMPLETED"
  });
}

export async function updateAssessmentInternalNotesAction(
  payload: UpdateAssessmentInternalNotesInput
): Promise<AssessmentActionResult> {
  try {
    const parsed = updateAssessmentInternalNotesSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the internal notes fields and try again.",
        fieldErrors: {
          assessmentRequestId: flattened.assessmentRequestId?.[0],
          internalNotes: flattened.internalNotes?.[0]
        }
      };
    }

    await requireAdmin();
    const assessment = await db.assessmentRequest.findUnique({
      where: { id: parsed.data.assessmentRequestId },
      select: { id: true, status: true }
    });

    if (!assessment) {
      return {
        success: false,
        message: "Assessment request not found."
      };
    }

    const updatedAssessment = await db.assessmentRequest.update({
      where: { id: assessment.id },
      data: {
        internalNotes: normalizeOptionalText(parsed.data.internalNotes)
      },
      select: {
        id: true,
        status: true
      }
    });

    return {
      success: true,
      message: "Internal notes saved successfully.",
      data: {
        assessmentRequestId: updatedAssessment.id,
        status: updatedAssessment.status
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to update internal notes."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function recordAssessmentOutcomeAction(
  payload: AssessmentOutcomeInput
): Promise<AssessmentActionResult> {
  try {
    const parsed = assessmentOutcomeSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the assessment outcome fields and try again.",
        fieldErrors: {
          assessmentRequestId: flattened.assessmentRequestId?.[0],
          academicLevelSummary: flattened.academicLevelSummary?.[0],
          strengths: flattened.strengths?.[0],
          weakAreas: flattened.weakAreas?.[0],
          recommendedSubjects: flattened.recommendedSubjects?.[0],
          recommendedPlanId: flattened.recommendedPlanId?.[0],
          recommendedWeeklyLessonCount:
            flattened.recommendedWeeklyLessonCount?.[0],
          parentFacingSummary: flattened.parentFacingSummary?.[0],
          internalAdminNotes: flattened.internalAdminNotes?.[0]
        }
      };
    }

    await requireAdmin();

    const assessment = await db.assessmentRequest.findUnique({
      where: { id: parsed.data.assessmentRequestId },
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

    if (!assessment) {
      return {
        success: false,
        message: "Assessment request not found."
      };
    }

    if (!canRecordAssessmentOutcome(assessment.status)) {
      return {
        success: false,
        message:
          "Assessment outcomes can only be recorded after an assessment is completed."
      };
    }

    const recommendedPlanId = parsed.data.recommendedPlanId?.trim() || null;

    if (recommendedPlanId) {
      const recommendedPlan = await db.tutoringPlan.findFirst({
        where: {
          id: recommendedPlanId,
          isActive: true
        },
        select: {
          id: true
        }
      });

      if (!recommendedPlan) {
        return {
          success: false,
          message: "Recommended plan not found or inactive.",
          fieldErrors: {
            recommendedPlanId: "Choose an active tutoring plan."
          }
        };
      }
    }

    const shouldRecommendPlan = shouldPublishAssessmentRecommendation({
      currentStatus: assessment.status,
      recommendedPlanId
    });

    if (shouldRecommendPlan) {
      assertAssessmentStatusTransition(assessment.status, "PLAN_RECOMMENDED");
    }

    const outcome = await db.$transaction(async (tx) => {
      const savedOutcome = await tx.assessmentOutcome.upsert({
        where: {
          assessmentRequestId: assessment.id
        },
        create: {
          assessmentRequestId: assessment.id,
          recommendedPlanId,
          academicLevelSummary: parsed.data.academicLevelSummary.trim(),
          strengths: parsed.data.strengths.trim(),
          weakAreas: parsed.data.weakAreas.trim(),
          recommendedSubjects: parsed.data.recommendedSubjects.map((subject) =>
            subject.trim()
          ),
          recommendedWeeklyLessonCount:
            parsed.data.recommendedWeeklyLessonCount,
          parentFacingSummary: parsed.data.parentFacingSummary.trim(),
          internalAdminNotes: parsed.data.internalAdminNotes?.trim() || ""
        },
        update: {
          recommendedPlanId,
          academicLevelSummary: parsed.data.academicLevelSummary.trim(),
          strengths: parsed.data.strengths.trim(),
          weakAreas: parsed.data.weakAreas.trim(),
          recommendedSubjects: parsed.data.recommendedSubjects.map((subject) =>
            subject.trim()
          ),
          recommendedWeeklyLessonCount:
            parsed.data.recommendedWeeklyLessonCount,
          parentFacingSummary: parsed.data.parentFacingSummary.trim(),
          internalAdminNotes: parsed.data.internalAdminNotes?.trim() || ""
        },
        select: {
          id: true
        }
      });

      if (shouldRecommendPlan) {
        await tx.assessmentRequest.update({
          where: { id: assessment.id },
          data: {
            status: "PLAN_RECOMMENDED"
          },
          select: {
            id: true
          }
        });
      }

      return savedOutcome;
    });

    if (recommendedPlanId) {
      await createNotification({
        userId: assessment.parent.userId,
        ...getPlanRecommendedNotificationPayload(assessment.id)
      });
    }

    return {
      success: true,
      message: recommendedPlanId
        ? "Assessment outcome saved and plan recommended."
        : "Assessment outcome saved. Add a plan when ready to publish the recommendation.",
      data: {
        assessmentRequestId: assessment.id,
        status: recommendedPlanId ? "PLAN_RECOMMENDED" : assessment.status,
        outcomeId: outcome.id
      }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to record assessment outcomes."
    );
    if (authResult) {
      return authResult;
    }

    const transitionResult = toTransitionErrorResult(error);
    if (transitionResult) {
      return transitionResult;
    }

    throw error;
  }
}
