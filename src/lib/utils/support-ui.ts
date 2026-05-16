import type { SupportStatus } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";
import { SUPPORT_STATUS_TRANSITIONS } from "@/server/services/support.service";

export type SupportStatusMeta = {
  label: string;
  tone: StatusTone;
  parentDescription: string;
  adminDescription: string;
};

const SUPPORT_STATUS_META: Record<SupportStatus, SupportStatusMeta> = {
  OPEN: {
    label: "Open",
    tone: "warning",
    parentDescription:
      "TopMox has received this request and will review the next step.",
    adminDescription: "New support request awaiting admin review."
  },
  IN_REVIEW: {
    label: "In Review",
    tone: "info",
    parentDescription:
      "TopMox is reviewing this request and will update you when there is a clear next step.",
    adminDescription: "Support request is actively being reviewed."
  },
  RESOLVED: {
    label: "Resolved",
    tone: "success",
    parentDescription:
      "This request has been resolved. Review the admin reply for the latest guidance.",
    adminDescription: "Support request has been resolved and can be closed."
  },
  CLOSED: {
    label: "Closed",
    tone: "neutral",
    parentDescription:
      "This request is closed. Create a new support request if you need more help.",
    adminDescription: "Support request is closed. Admin may reopen if needed."
  }
};

export function getSupportStatusMeta(
  status: SupportStatus
): SupportStatusMeta {
  return SUPPORT_STATUS_META[status];
}

export function buildAdminSupportStatusOptions(
  status: SupportStatus
): SupportStatus[] {
  return SUPPORT_STATUS_TRANSITIONS[status];
}

export type ParentSupportRequestSource = {
  id: string;
  subject: string;
  message: string;
  adminReply: string | null;
  status: SupportStatus;
  createdAt: Date;
  updatedAt: Date;
  communicationLogs?: unknown;
};

export function shapeParentSupportRequestDetail(
  supportRequest: ParentSupportRequestSource
) {
  return {
    id: supportRequest.id,
    subject: supportRequest.subject,
    message: supportRequest.message,
    adminReply: supportRequest.adminReply,
    status: supportRequest.status,
    createdAt: supportRequest.createdAt,
    updatedAt: supportRequest.updatedAt,
    statusMeta: getSupportStatusMeta(supportRequest.status)
  };
}
