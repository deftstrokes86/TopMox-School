import { requireParent } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentParentChildren() {
  const user = await requireParent();

  return db.studentProfile.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      countryOfStudy: true,
      curriculum: true,
      mainAcademicChallenge: true,
      academicGoal: true,
      preferredLessonDays: true,
      preferredLessonTime: true,
      subjects: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getChildProfileByIdForCurrentParent(childId: string) {
  const user = await requireParent();

  return db.studentProfile.findFirst({
    where: {
      id: childId,
      parent: {
        userId: user.id
      }
    },
    select: {
      id: true,
      parentId: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      countryOfStudy: true,
      curriculum: true,
      mainAcademicChallenge: true,
      academicGoal: true,
      preferredLessonDays: true,
      preferredLessonTime: true,
      subjects: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      createdAt: true,
      updatedAt: true
    }
  });
}
