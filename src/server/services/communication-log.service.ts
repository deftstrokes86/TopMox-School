import type { Prisma, Role } from "@prisma/client";

import type { CreateCommunicationLogInput } from "@/lib/validations/communication-log.schema";

export class CommunicationLogAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommunicationLogAccessError";
  }
}

export function assertCanCreateCommunicationLog(role: Role): void {
  if (role !== "ADMIN") {
    throw new CommunicationLogAccessError(
      "Only admins can create communication logs in this phase."
    );
  }
}

export function assertCanReadCommunicationLogs(role: Role): void {
  if (role !== "ADMIN") {
    throw new CommunicationLogAccessError(
      "Communication logs are internal admin records in this phase."
    );
  }
}

export function buildCommunicationLogLinkData(
  input: Partial<
    Pick<
      CreateCommunicationLogInput,
      | "parentId"
      | "studentId"
      | "assessmentRequestId"
      | "lessonId"
      | "paymentId"
      | "supportRequestId"
    >
  >
): Partial<Prisma.CommunicationLogUncheckedCreateInput> {
  return {
    ...(input.parentId ? { parentId: input.parentId } : {}),
    ...(input.studentId ? { studentId: input.studentId } : {}),
    ...(input.assessmentRequestId
      ? { assessmentRequestId: input.assessmentRequestId }
      : {}),
    ...(input.lessonId ? { lessonId: input.lessonId } : {}),
    ...(input.paymentId ? { paymentId: input.paymentId } : {}),
    ...(input.supportRequestId
      ? { supportRequestId: input.supportRequestId }
      : {})
  };
}

export function buildCommunicationLogWhereInputForEntity(
  input: Partial<
    Pick<
      CreateCommunicationLogInput,
      | "parentId"
      | "studentId"
      | "assessmentRequestId"
      | "lessonId"
      | "paymentId"
      | "supportRequestId"
    >
  >
): Prisma.CommunicationLogWhereInput {
  return {
    ...(input.parentId ? { parentId: input.parentId } : {}),
    ...(input.studentId ? { studentId: input.studentId } : {}),
    ...(input.assessmentRequestId
      ? { assessmentRequestId: input.assessmentRequestId }
      : {}),
    ...(input.lessonId ? { lessonId: input.lessonId } : {}),
    ...(input.paymentId ? { paymentId: input.paymentId } : {}),
    ...(input.supportRequestId
      ? { supportRequestId: input.supportRequestId }
      : {})
  };
}

type CommunicationLogCreateClient = {
  communicationLog: {
    create: (
      args: Prisma.CommunicationLogCreateArgs
    ) => Promise<{ id: string }>;
  };
};

type CommunicationLogReadClient<TLog = unknown> = {
  communicationLog: {
    findMany: (args: {
      where: Prisma.CommunicationLogWhereInput;
      orderBy: { createdAt: "desc" };
      take?: number;
    }) => Promise<TLog[]>;
  };
};

export async function createCommunicationLog(
  client: CommunicationLogCreateClient,
  input: CreateCommunicationLogInput & { createdById: string }
) {
  return client.communicationLog.create({
    data: {
      type: input.type,
      message: input.message.trim(),
      createdById: input.createdById,
      ...buildCommunicationLogLinkData(input)
    },
    select: {
      id: true
    }
  });
}

export async function getEntityCommunicationLogs<TLog>(
  client: CommunicationLogReadClient<TLog>,
  input: {
    role: Role;
    where: Prisma.CommunicationLogWhereInput;
    take?: number;
  }
) {
  assertCanReadCommunicationLogs(input.role);

  return client.communicationLog.findMany({
    where: input.where,
    orderBy: {
      createdAt: "desc"
    },
    take: input.take
  });
}
