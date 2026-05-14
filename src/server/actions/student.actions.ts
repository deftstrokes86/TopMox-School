"use server";

import { AuthError, requireParent } from "@/lib/auth";
import { SUPPORT_SUBJECT_OPTIONS } from "@/lib/constants/subjects";
import { db } from "@/lib/db";
import {
  childProfileSchema,
  childProfileSubjectsSchema,
  updateChildProfileSchema,
  type ChildProfileInput,
  type ChildProfileSubjectsInput,
  type UpdateChildProfileInput
} from "@/lib/validations/student.schema";

type ChildProfileFieldErrors = Partial<
  Record<keyof ChildProfileInput | "childId" | "subjectsNeedingSupport", string>
>;

export type ChildProfileActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: ChildProfileFieldErrors;
  data?: {
    childId: string;
  };
};

type ResolvedSubjects =
  | {
      success: true;
      subjectIds: string[];
    }
  | {
      success: false;
      fieldErrors: ChildProfileFieldErrors;
      message: string;
    };

function toAuthErrorResult(error: unknown, deniedMessage: string) {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : deniedMessage
    } satisfies ChildProfileActionResult;
  }

  return null;
}

async function getCurrentParentProfileId(userId: string): Promise<string | null> {
  const parentProfile = await db.parentProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  return parentProfile?.id ?? null;
}

async function resolveSubjectIds(
  subjectsNeedingSupport: string[]
): Promise<ResolvedSubjects> {
  const requestedSubjects = Array.from(
    new Set(
      subjectsNeedingSupport
        .map((subject) => subject.trim())
        .filter((subject) => subject.length > 0)
    )
  );

  if (requestedSubjects.length === 0) {
    return {
      success: false,
      message: "At least one subject is required.",
      fieldErrors: {
        subjectsNeedingSupport: "At least one subject is required."
      }
    };
  }

  const supportedSubjectMap = new Map<
    string,
    { slug: string; name: string; description: string }
  >();
  for (const subject of SUPPORT_SUBJECT_OPTIONS) {
    supportedSubjectMap.set(subject.slug.toLowerCase(), subject);
    supportedSubjectMap.set(subject.name.toLowerCase(), subject);
  }

  const normalizedSubjects = requestedSubjects.map((subject) =>
    subject.toLowerCase()
  );

  const canonicalSubjects = normalizedSubjects.map((subject) =>
    supportedSubjectMap.get(subject)
  );

  const missingSubjects = normalizedSubjects.filter(
    (_, index) => !canonicalSubjects[index]
  );

  if (missingSubjects.length > 0) {
    return {
      success: false,
      message: "Some selected subjects are not available yet.",
      fieldErrors: {
        subjectsNeedingSupport: `Unknown subjects: ${missingSubjects.join(", ")}`
      }
    };
  }

  const uniqueCanonicalSubjects = Array.from(
    new Map(
      canonicalSubjects
        .filter((subject): subject is NonNullable<typeof subject> =>
          Boolean(subject)
        )
        .map((subject) => [subject.slug, subject])
    ).values()
  );

  const resolvedSubjects = await Promise.all(
    uniqueCanonicalSubjects.map((subject) =>
      db.subject.upsert({
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
      })
    )
  );

  return {
    success: true,
    subjectIds: resolvedSubjects.map((subject) => subject.id)
  };
}

export async function createChildProfileAction(
  payload: ChildProfileInput
): Promise<ChildProfileActionResult> {
  try {
    const parsed = childProfileSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;

      return {
        success: false,
        message: "Please check the child profile fields and try again.",
        fieldErrors: {
          fullName: flattened.fullName?.[0],
          age: flattened.age?.[0],
          classYearGroup: flattened.classYearGroup?.[0],
          countryOfStudy: flattened.countryOfStudy?.[0],
          curriculum: flattened.curriculum?.[0],
          subjectsNeedingSupport: flattened.subjectsNeedingSupport?.[0],
          mainAcademicChallenge: flattened.mainAcademicChallenge?.[0],
          academicGoal: flattened.academicGoal?.[0],
          preferredLessonDays: flattened.preferredLessonDays?.[0],
          preferredLessonTime: flattened.preferredLessonTime?.[0]
        }
      };
    }

    const user = await requireParent();
    const parentProfileId = await getCurrentParentProfileId(user.id);

    if (!parentProfileId) {
      return {
        success: false,
        message:
          "Complete parent onboarding first before adding a child profile."
      };
    }

    const resolvedSubjects = await resolveSubjectIds(
      parsed.data.subjectsNeedingSupport
    );
    if (!resolvedSubjects.success) {
      return resolvedSubjects;
    }

    const child = await db.studentProfile.create({
      data: {
        parentId: parentProfileId,
        fullName: parsed.data.fullName.trim(),
        age: parsed.data.age,
        classYearGroup: parsed.data.classYearGroup.trim(),
        countryOfStudy: parsed.data.countryOfStudy.trim(),
        curriculum: parsed.data.curriculum.trim(),
        mainAcademicChallenge: parsed.data.mainAcademicChallenge.trim(),
        academicGoal: parsed.data.academicGoal.trim(),
        preferredLessonDays: parsed.data.preferredLessonDays.map((day) =>
          day.trim()
        ),
        preferredLessonTime: parsed.data.preferredLessonTime.trim(),
        subjects: {
          connect: resolvedSubjects.subjectIds.map((subjectId) => ({ id: subjectId }))
        }
      },
      select: {
        id: true
      }
    });

    return {
      success: true,
      message: "Child profile created successfully.",
      data: { childId: child.id }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to create child profiles."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function updateChildProfileAction(
  payload: UpdateChildProfileInput
): Promise<ChildProfileActionResult> {
  try {
    const parsed = updateChildProfileSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the child profile fields and try again.",
        fieldErrors: {
          childId: flattened.childId?.[0],
          fullName: flattened.fullName?.[0],
          age: flattened.age?.[0],
          classYearGroup: flattened.classYearGroup?.[0],
          countryOfStudy: flattened.countryOfStudy?.[0],
          curriculum: flattened.curriculum?.[0],
          subjectsNeedingSupport: flattened.subjectsNeedingSupport?.[0],
          mainAcademicChallenge: flattened.mainAcademicChallenge?.[0],
          academicGoal: flattened.academicGoal?.[0],
          preferredLessonDays: flattened.preferredLessonDays?.[0],
          preferredLessonTime: flattened.preferredLessonTime?.[0]
        }
      };
    }

    const user = await requireParent();

    const existingChild = await db.studentProfile.findFirst({
      where: {
        id: parsed.data.childId,
        parent: {
          userId: user.id
        }
      },
      select: {
        id: true
      }
    });

    if (!existingChild) {
      return {
        success: false,
        message: "Child profile not found or you do not have access to edit it."
      };
    }

    const resolvedSubjects = await resolveSubjectIds(
      parsed.data.subjectsNeedingSupport
    );
    if (!resolvedSubjects.success) {
      return resolvedSubjects;
    }

    const child = await db.studentProfile.update({
      where: {
        id: existingChild.id
      },
      data: {
        fullName: parsed.data.fullName.trim(),
        age: parsed.data.age,
        classYearGroup: parsed.data.classYearGroup.trim(),
        countryOfStudy: parsed.data.countryOfStudy.trim(),
        curriculum: parsed.data.curriculum.trim(),
        mainAcademicChallenge: parsed.data.mainAcademicChallenge.trim(),
        academicGoal: parsed.data.academicGoal.trim(),
        preferredLessonDays: parsed.data.preferredLessonDays.map((day) =>
          day.trim()
        ),
        preferredLessonTime: parsed.data.preferredLessonTime.trim(),
        subjects: {
          set: resolvedSubjects.subjectIds.map((subjectId) => ({ id: subjectId }))
        }
      },
      select: {
        id: true
      }
    });

    return {
      success: true,
      message: "Child profile updated successfully.",
      data: { childId: child.id }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to update this child profile."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

export async function addSubjectsToChildProfile(
  payload: ChildProfileSubjectsInput
): Promise<ChildProfileActionResult> {
  try {
    const parsed = childProfileSubjectsSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the subject selection and try again.",
        fieldErrors: {
          childId: flattened.childId?.[0],
          subjectsNeedingSupport: flattened.subjectsNeedingSupport?.[0]
        }
      };
    }

    const user = await requireParent();
    const child = await db.studentProfile.findFirst({
      where: {
        id: parsed.data.childId,
        parent: {
          userId: user.id
        }
      },
      select: {
        id: true
      }
    });

    if (!child) {
      return {
        success: false,
        message: "Child profile not found or you do not have access to edit it."
      };
    }

    const resolvedSubjects = await resolveSubjectIds(
      parsed.data.subjectsNeedingSupport
    );
    if (!resolvedSubjects.success) {
      return resolvedSubjects;
    }

    await db.studentProfile.update({
      where: {
        id: child.id
      },
      data: {
        subjects: {
          set: resolvedSubjects.subjectIds.map((subjectId) => ({ id: subjectId }))
        }
      },
      select: {
        id: true
      }
    });

    return {
      success: true,
      message: "Child subjects updated successfully.",
      data: { childId: child.id }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to update this child profile."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}

/**
 * Delete is intentionally conservative in Phase 5A.
 * We only allow deletion when the child profile has no linked workflow records.
 */
export async function deleteChildProfileAction(
  childId: string
): Promise<ChildProfileActionResult> {
  try {
    const user = await requireParent();

    const child = await db.studentProfile.findFirst({
      where: {
        id: childId,
        parent: {
          userId: user.id
        }
      },
      select: {
        id: true,
        _count: {
          select: {
            assessmentRequests: true,
            enrollments: true,
            lessons: true,
            homework: true,
            progressReports: true,
            supportRequests: true,
            payments: true
          }
        }
      }
    });

    if (!child) {
      return {
        success: false,
        message: "Child profile not found or you do not have access to delete it."
      };
    }

    const linkedRecordsCount =
      child._count.assessmentRequests +
      child._count.enrollments +
      child._count.lessons +
      child._count.homework +
      child._count.progressReports +
      child._count.supportRequests +
      child._count.payments;

    if (linkedRecordsCount > 0) {
      return {
        success: false,
        message:
          "This child profile already has linked records and cannot be deleted in this phase."
      };
    }

    await db.studentProfile.delete({
      where: {
        id: child.id
      },
      select: {
        id: true
      }
    });

    return {
      success: true,
      message: "Child profile deleted successfully.",
      data: { childId: child.id }
    };
  } catch (error) {
    const authResult = toAuthErrorResult(
      error,
      "You do not have permission to delete this child profile."
    );
    if (authResult) {
      return authResult;
    }

    throw error;
  }
}
