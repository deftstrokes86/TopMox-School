import type { CommunicationLogType, Role } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type CommunicationLogTargetType =
  | "supportRequest"
  | "parent"
  | "student"
  | "payment"
  | "assessment"
  | "lesson";

export type CommunicationLogTargetInput = Partial<{
  supportRequestId: string;
  parentId: string;
  studentId: string;
  paymentId: string;
  assessmentRequestId: string;
  lessonId: string;
}>;

export type CommunicationLogTypeMeta = {
  label: string;
  tone: StatusTone;
  description: string;
};

const COMMUNICATION_LOG_TYPE_META: Record<
  CommunicationLogType,
  CommunicationLogTypeMeta
> = {
  CALL: {
    label: "Call",
    tone: "info",
    description: "Phone or video conversation with a parent or operator."
  },
  WHATSAPP: {
    label: "WhatsApp",
    tone: "success",
    description: "WhatsApp follow-up recorded for internal continuity."
  },
  EMAIL: {
    label: "Email",
    tone: "neutral",
    description: "Email communication or follow-up."
  },
  INTERNAL_NOTE: {
    label: "Internal Note",
    tone: "warning",
    description: "Private TopMox operational note."
  },
  PAYMENT_FOLLOW_UP: {
    label: "Payment Follow-Up",
    tone: "warning",
    description: "Payment verification or payment-support follow-up."
  },
  ACADEMIC_FOLLOW_UP: {
    label: "Academic Follow-Up",
    tone: "info",
    description: "Academic concern, lesson, homework, or report follow-up."
  }
};

export function getCommunicationLogTypeMeta(
  type: CommunicationLogType
): CommunicationLogTypeMeta {
  return COMMUNICATION_LOG_TYPE_META[type];
}

export function buildCommunicationLogTargetInput(
  targetType: CommunicationLogTargetType,
  targetId: string
): CommunicationLogTargetInput {
  if (targetType === "supportRequest") {
    return { supportRequestId: targetId };
  }

  if (targetType === "parent") {
    return { parentId: targetId };
  }

  if (targetType === "student") {
    return { studentId: targetId };
  }

  if (targetType === "payment") {
    return { paymentId: targetId };
  }

  if (targetType === "assessment") {
    return { assessmentRequestId: targetId };
  }

  return { lessonId: targetId };
}

export function canRenderCommunicationLogPanel(role: Role): boolean {
  return role === "ADMIN";
}
