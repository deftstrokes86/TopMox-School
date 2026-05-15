import type {
  NotificationType,
  Role,
  SupportStatus
} from "@prisma/client";

export class SupportStatusTransitionError extends Error {
  constructor(currentStatus: SupportStatus, nextStatus: SupportStatus) {
    super(`Cannot transition support request from ${currentStatus} to ${nextStatus}.`);
    this.name = "SupportStatusTransitionError";
  }
}

export class SupportAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupportAccessError";
  }
}

export const SUPPORT_STATUS_TRANSITIONS: Record<
  SupportStatus,
  SupportStatus[]
> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: ["OPEN"]
};

export function canTransitionSupportStatus(
  currentStatus: SupportStatus,
  nextStatus: SupportStatus,
  options: { role?: Role } = {}
): boolean {
  if (currentStatus === "CLOSED" && nextStatus === "OPEN") {
    return options.role === "ADMIN";
  }

  return SUPPORT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertSupportStatusTransition(
  currentStatus: SupportStatus,
  nextStatus: SupportStatus,
  options: { role?: Role } = {}
): void {
  if (!canTransitionSupportStatus(currentStatus, nextStatus, options)) {
    throw new SupportStatusTransitionError(currentStatus, nextStatus);
  }
}

export function assertCanCreateSupportRequest(role: Role): void {
  if (role !== "PARENT") {
    throw new SupportAccessError(
      "Only parents can create support requests in this phase."
    );
  }
}

export type ParentSupportLinkAccessInput = {
  studentBelongsToParent?: boolean;
  lessonBelongsToParent?: boolean;
  paymentBelongsToParent?: boolean;
  assessmentBelongsToParent?: boolean;
};

export function assertParentCanLinkSupportRecord({
  studentBelongsToParent = true,
  lessonBelongsToParent = true,
  paymentBelongsToParent = true,
  assessmentBelongsToParent = true
}: ParentSupportLinkAccessInput): void {
  if (!studentBelongsToParent) {
    throw new SupportAccessError("Student not found for this parent.");
  }

  if (!lessonBelongsToParent) {
    throw new SupportAccessError("Lesson not found for this parent.");
  }

  if (!paymentBelongsToParent) {
    throw new SupportAccessError("Payment not found for this parent.");
  }

  if (!assessmentBelongsToParent) {
    throw new SupportAccessError("Assessment not found for this parent.");
  }
}

function supportNotificationPayload({
  title,
  message,
  href
}: {
  title: string;
  message: string;
  href: string;
}) {
  return {
    type: "SUPPORT_UPDATED" as NotificationType,
    title,
    message,
    href
  };
}

export function getSupportSubmittedAdminNotificationPayload(
  supportRequestId: string
) {
  return supportNotificationPayload({
    title: "New support request submitted.",
    message: "A parent submitted a support request for TopMox review.",
    href: `/admin/support/${supportRequestId}`
  });
}

export function getSupportUpdatedParentNotificationPayload(
  supportRequestId: string
) {
  return supportNotificationPayload({
    title: "Your support request has been updated.",
    message:
      "TopMox has updated your support request. Review the latest status in your parent dashboard.",
    href: `/parent/support/${supportRequestId}`
  });
}
