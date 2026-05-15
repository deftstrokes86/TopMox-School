import type { AppRole } from "./types";

export type StudentAccessDbClient = {
  studentProfile: {
    findFirst: (args: {
      where: {
        id?: string;
        studentId?: string;
        parent?: { userId: string };
        tutor?: { userId: string };
      };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
  lesson: {
    findFirst: (args: {
      where: {
        studentId?: string;
        tutor?: { userId: string };
      };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

export type AssessmentAccessDbClient = {
  assessmentRequest: {
    findFirst: (args: {
      where: {
        id?: string;
        parent?: { userId: string };
      };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

export async function canAccessStudentWithClient(
  dbClient: StudentAccessDbClient,
  userId: string,
  role: AppRole,
  studentId: string
): Promise<boolean> {
  if (!userId || !studentId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  if (role === "PARENT") {
    const student = await dbClient.studentProfile.findFirst({
      where: {
        id: studentId,
        parent: {
          userId
        }
      },
      select: { id: true }
    });

    return Boolean(student);
  }

  if (role === "TUTOR") {
    const lesson = await dbClient.lesson.findFirst({
      where: {
        studentId,
        tutor: {
          userId
        }
      },
      select: { id: true }
    });

    return Boolean(lesson);
  }

  return false;
}

export async function canAccessAssessmentWithClient(
  dbClient: AssessmentAccessDbClient,
  userId: string,
  role: AppRole,
  assessmentId: string
): Promise<boolean> {
  if (!userId || !assessmentId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  if (role !== "PARENT") {
    return false;
  }

  const assessment = await dbClient.assessmentRequest.findFirst({
    where: {
      id: assessmentId,
      parent: {
        userId
      }
    },
    select: { id: true }
  });

  return Boolean(assessment);
}
