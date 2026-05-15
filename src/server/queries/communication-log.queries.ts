import type { CommunicationLogType, Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const communicationLogSelect = {
  id: true,
  type: true,
  message: true,
  parentId: true,
  studentId: true,
  assessmentRequestId: true,
  lessonId: true,
  paymentId: true,
  supportRequestId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
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
  student: {
    select: {
      fullName: true
    }
  },
  supportRequest: {
    select: {
      subject: true,
      status: true
    }
  }
} satisfies Prisma.CommunicationLogSelect;

export type CommunicationLogQueryResult = Prisma.CommunicationLogGetPayload<{
  select: typeof communicationLogSelect;
}>;

export type CommunicationLogFilters = {
  type?: CommunicationLogType;
  take?: number;
};

function withFilters(
  where: Prisma.CommunicationLogWhereInput,
  filters: CommunicationLogFilters = {}
): Prisma.CommunicationLogWhereInput {
  return {
    ...where,
    ...(filters.type ? { type: filters.type } : {})
  };
}

export function buildCommunicationLogWhereInputForParent(
  parentId: string
): Prisma.CommunicationLogWhereInput {
  return {
    parentId
  };
}

export function buildCommunicationLogWhereInputForStudent(
  studentId: string
): Prisma.CommunicationLogWhereInput {
  return {
    studentId
  };
}

export function buildCommunicationLogWhereInputForAssessment(
  assessmentRequestId: string
): Prisma.CommunicationLogWhereInput {
  return {
    assessmentRequestId
  };
}

export function buildCommunicationLogWhereInputForLesson(
  lessonId: string
): Prisma.CommunicationLogWhereInput {
  return {
    lessonId
  };
}

export function buildCommunicationLogWhereInputForPayment(
  paymentId: string
): Prisma.CommunicationLogWhereInput {
  return {
    paymentId
  };
}

export function buildCommunicationLogWhereInputForSupportRequest(
  supportRequestId: string
): Prisma.CommunicationLogWhereInput {
  return {
    supportRequestId
  };
}

async function getCommunicationLogs(
  where: Prisma.CommunicationLogWhereInput,
  filters: CommunicationLogFilters = {}
) {
  await requireAdmin();

  return db.communicationLog.findMany({
    where: withFilters(where, filters),
    select: communicationLogSelect,
    orderBy: {
      createdAt: "desc"
    },
    take: filters.take
  });
}

export async function getCommunicationLogsForParent(
  parentId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForParent(parentId),
    filters
  );
}

export async function getCommunicationLogsForStudent(
  studentId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForStudent(studentId),
    filters
  );
}

export async function getCommunicationLogsForAssessment(
  assessmentRequestId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForAssessment(assessmentRequestId),
    filters
  );
}

export async function getCommunicationLogsForLesson(
  lessonId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForLesson(lessonId),
    filters
  );
}

export async function getCommunicationLogsForPayment(
  paymentId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForPayment(paymentId),
    filters
  );
}

export async function getCommunicationLogsForSupportRequest(
  supportRequestId: string,
  filters: CommunicationLogFilters = {}
) {
  return getCommunicationLogs(
    buildCommunicationLogWhereInputForSupportRequest(supportRequestId),
    filters
  );
}
