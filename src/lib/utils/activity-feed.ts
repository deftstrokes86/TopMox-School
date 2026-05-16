import type { StatusTone } from "@/lib/constants/statuses";
import { getSafeNotificationHrefForRole } from "@/lib/utils/notification-ui";

export type ActivityCategory =
  | "assessment"
  | "payment"
  | "lesson"
  | "homework"
  | "report"
  | "support"
  | "communication"
  | "notification";

export type ActivityFeedItem = {
  id: string;
  recordId: string;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: Date;
  href?: string;
  tone?: StatusTone;
};

type TimestampValue = Date | string;

type AssessmentActivityRecord = {
  id: string;
  parentId: string;
  childName?: string | null;
  status: string;
  timestamp: TimestampValue;
};

type PaymentActivityRecord = {
  id: string;
  parentId: string;
  childName?: string | null;
  status: string;
  amount?: string | number | null;
  currency?: string | null;
  timestamp: TimestampValue;
};

type LessonActivityRecord = {
  id: string;
  parentId: string;
  tutorId: string;
  childName?: string | null;
  subjectName?: string | null;
  title?: string | null;
  status: string;
  timestamp: TimestampValue;
};

type HomeworkActivityRecord = {
  id: string;
  parentId: string;
  tutorId: string;
  childName?: string | null;
  title: string;
  status: string;
  timestamp: TimestampValue;
};

type ReportActivityRecord = {
  id: string;
  parentId: string;
  tutorId: string;
  childName?: string | null;
  status: string;
  timestamp: TimestampValue;
};

type SupportActivityRecord = {
  id: string;
  parentId: string;
  subject: string;
  status: string;
  timestamp: TimestampValue;
};

type CommunicationActivityRecord = {
  id: string;
  parentId?: string | null;
  studentId?: string | null;
  assessmentRequestId?: string | null;
  lessonId?: string | null;
  paymentId?: string | null;
  supportRequestId?: string | null;
  type: string;
  message: string;
  timestamp: TimestampValue;
};

type NotificationActivityRecord = {
  id: string;
  title: string;
  message: string;
  href?: string | null;
  timestamp: TimestampValue;
};

export type ActivityFeedRecords = {
  assessments?: AssessmentActivityRecord[];
  payments?: PaymentActivityRecord[];
  lessons?: LessonActivityRecord[];
  homework?: HomeworkActivityRecord[];
  reports?: ReportActivityRecord[];
  supportRequests?: SupportActivityRecord[];
  communicationLogs?: CommunicationActivityRecord[];
  notifications?: NotificationActivityRecord[];
};

function toDate(value: TimestampValue): Date {
  return value instanceof Date ? value : new Date(value);
}

export function humanizeActivityStatus(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getToneForStatus(status: string): StatusTone {
  if (["PAID", "ACTIVE", "COMPLETED", "PUBLISHED", "RESOLVED"].includes(status)) {
    return "success";
  }

  if (
    [
      "PENDING",
      "PENDING_REVIEW",
      "PENDING_PAYMENT",
      "AWAITING_VERIFICATION",
      "IN_REVIEW",
      "DRAFT",
      "SCHEDULED",
      "ASSIGNED",
      "OPEN"
    ].includes(status)
  ) {
    return "info";
  }

  if (["FAILED", "DECLINED", "CANCELLED", "MISSED", "CLOSED"].includes(status)) {
    return "warning";
  }

  return "neutral";
}

function buildPaymentAmount(record: PaymentActivityRecord): string {
  if (!record.amount || !record.currency) {
    return "payment details updated";
  }

  return `${record.currency} ${record.amount}`;
}

function getRoleHref(role: "admin" | "parent" | "tutor", path: string): string {
  return `/${role}${path}`;
}

function getNotificationHrefForActivityRole(
  role: "admin" | "parent" | "tutor",
  href: string | null | undefined
): string | undefined {
  const appRole =
    role === "admin" ? "ADMIN" : role === "tutor" ? "TUTOR" : "PARENT";
  const safeHref = getSafeNotificationHrefForRole(appRole, href);

  return safeHref ?? undefined;
}

function buildCommunicationHref(record: CommunicationActivityRecord): string | undefined {
  if (record.supportRequestId) {
    return getRoleHref("admin", `/support/${record.supportRequestId}`);
  }

  if (record.paymentId) {
    return getRoleHref("admin", `/payments/${record.paymentId}`);
  }

  if (record.assessmentRequestId) {
    return getRoleHref("admin", `/assessments/${record.assessmentRequestId}`);
  }

  if (record.lessonId) {
    return getRoleHref("admin", `/lessons/${record.lessonId}`);
  }

  return undefined;
}

function buildCommonItems(
  records: ActivityFeedRecords,
  role: "admin" | "parent" | "tutor"
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const record of records.assessments ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    items.push({
      id: `assessment-${record.id}`,
      recordId: record.id,
      category: "assessment",
      title: `${record.childName ?? "Child"} assessment ${statusLabel.toLowerCase()}`,
      description: `Assessment request is ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role === "admin" ? "admin" : "parent", `/assessments/${record.id}`),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.payments ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    items.push({
      id: `payment-${record.id}`,
      recordId: record.id,
      category: "payment",
      title: `${record.childName ?? "Child"} payment ${statusLabel.toLowerCase()}`,
      description: `${buildPaymentAmount(record)} is ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role === "admin" ? "admin" : "parent", `/payments/${record.id}`),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.lessons ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    const subject = record.subjectName ?? "lesson";
    items.push({
      id: `lesson-${record.id}`,
      recordId: record.id,
      category: "lesson",
      title: `${record.childName ?? "Student"} ${subject} lesson ${statusLabel.toLowerCase()}`,
      description: record.title
        ? `${record.title} is ${statusLabel.toLowerCase()}.`
        : `Lesson status is ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role, `/lessons/${record.id}`),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.homework ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    items.push({
      id: `homework-${record.id}`,
      recordId: record.id,
      category: "homework",
      title: `${record.title} homework ${statusLabel.toLowerCase()}`,
      description: `${record.childName ?? "Student"} has homework marked ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role, "/homework"),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.reports ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    items.push({
      id: `report-${record.id}`,
      recordId: record.id,
      category: "report",
      title: `${record.childName ?? "Student"} report ${statusLabel.toLowerCase()}`,
      description: `Progress report is ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role, `/reports/${record.id}`),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.supportRequests ?? []) {
    const statusLabel = humanizeActivityStatus(record.status);
    items.push({
      id: `support-${record.id}`,
      recordId: record.id,
      category: "support",
      title: `Support request: ${record.subject}`,
      description: `Support status is ${statusLabel.toLowerCase()}.`,
      timestamp: toDate(record.timestamp),
      href: getRoleHref(role === "admin" ? "admin" : "parent", `/support/${record.id}`),
      tone: getToneForStatus(record.status)
    });
  }

  for (const record of records.notifications ?? []) {
    items.push({
      id: `notification-${record.id}`,
      recordId: record.id,
      category: "notification",
      title: record.title,
      description: record.message,
      timestamp: toDate(record.timestamp),
      href: getNotificationHrefForActivityRole(role, record.href),
      tone: "info"
    });
  }

  return items;
}

export function sortActivityItems(
  items: ActivityFeedItem[],
  limit = 8
): ActivityFeedItem[] {
  return [...items]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, limit);
}

export function buildAdminActivityFeedFromRecords(
  records: ActivityFeedRecords,
  limit = 8
): ActivityFeedItem[] {
  const items = buildCommonItems(records, "admin");

  for (const record of records.communicationLogs ?? []) {
    items.push({
      id: `communication-${record.id}`,
      recordId: record.id,
      category: "communication",
      title: `${humanizeActivityStatus(record.type)} recorded`,
      description: record.message,
      timestamp: toDate(record.timestamp),
      href: buildCommunicationHref(record),
      tone: "neutral"
    });
  }

  return sortActivityItems(items, limit);
}

export function buildParentActivityFeedFromRecords(
  records: ActivityFeedRecords,
  parentId: string,
  limit = 8
): ActivityFeedItem[] {
  return sortActivityItems(
    buildCommonItems(
      {
        assessments: (records.assessments ?? []).filter(
          (record) => record.parentId === parentId
        ),
        payments: (records.payments ?? []).filter(
          (record) => record.parentId === parentId
        ),
        lessons: (records.lessons ?? []).filter(
          (record) => record.parentId === parentId
        ),
        homework: (records.homework ?? []).filter(
          (record) => record.parentId === parentId
        ),
        reports: (records.reports ?? []).filter(
          (record) => record.parentId === parentId
        ),
        supportRequests: (records.supportRequests ?? []).filter(
          (record) => record.parentId === parentId
        ),
        notifications: records.notifications
      },
      "parent"
    ),
    limit
  );
}

export function buildTutorActivityFeedFromRecords(
  records: ActivityFeedRecords,
  tutorId: string,
  limit = 8
): ActivityFeedItem[] {
  return sortActivityItems(
    buildCommonItems(
      {
        lessons: (records.lessons ?? []).filter(
          (record) => record.tutorId === tutorId
        ),
        homework: (records.homework ?? []).filter(
          (record) => record.tutorId === tutorId
        ),
        reports: (records.reports ?? []).filter(
          (record) => record.tutorId === tutorId
        ),
        notifications: records.notifications
      },
      "tutor"
    ),
    limit
  );
}
