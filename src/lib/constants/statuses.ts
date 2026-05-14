export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export const ASSESSMENT_STATUSES = [
  "PENDING_REVIEW",
  "SCHEDULED",
  "COMPLETED",
  "PLAN_RECOMMENDED",
  "CONVERTED",
  "DECLINED"
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "AWAITING_VERIFICATION",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED"
] as const;

export const ENROLLMENT_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED"
] as const;

export const LESSON_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "RESCHEDULED",
  "CANCELLED"
] as const;

export const REPORT_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED"] as const;

export const SUPPORT_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "CLOSED"
] as const;
